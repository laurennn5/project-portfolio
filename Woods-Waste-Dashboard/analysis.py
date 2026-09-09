from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"


def load_one_waste_file(file_path: str, month: str) -> pd.DataFrame:
    """
    Loads one Woods waste CSV and converts it from the original wide
    spreadsheet format into a clean long-format table.

    Output columns:
    month, store, item_name, quantity_wasted, quantity_sold, waste_rate
    """
    raw = pd.read_csv(file_path, header=None)

    records = []
    data_start_row = 4

    store_cols = [
        {
            "store": "All Stores",
            "waste_col": 1,
            "sold_col": 2
        }
    ]

    # Store-level columns start later in the sheet.
    # Each store has Total Waste, Total Sold, Percentage Wasted.
    for col in range(5, raw.shape[1] - 2):
        header = raw.iloc[2, col]

        if str(header).strip() == "Total Waste":
            store_name = raw.iloc[1, col]

            if pd.notna(store_name):
                store_cols.append({
                    "store": str(store_name).strip(),
                    "waste_col": col,
                    "sold_col": col + 1
                })

    for row_idx in range(data_start_row, raw.shape[0]):
        item_name = raw.iloc[row_idx, 0]

        if pd.isna(item_name):
            continue

        item_name = str(item_name).strip()

        if "expiration" in item_name.lower():
            continue

        for store_info in store_cols:
            quantity_wasted = pd.to_numeric(
                raw.iloc[row_idx, store_info["waste_col"]],
                errors="coerce"
            )

            quantity_sold = pd.to_numeric(
                raw.iloc[row_idx, store_info["sold_col"]],
                errors="coerce"
            )

            if pd.isna(quantity_wasted) or pd.isna(quantity_sold):
                continue

            if quantity_wasted < 0 or quantity_sold < 0:
                continue

            total_quantity = quantity_wasted + quantity_sold

            if total_quantity == 0:
                waste_rate = 0
            else:
                waste_rate = quantity_wasted / total_quantity

            records.append({
                "month": month,
                "store": store_info["store"],
                "item_name": item_name,
                "quantity_wasted": quantity_wasted,
                "quantity_sold": quantity_sold,
                "waste_rate": waste_rate
            })

    return pd.DataFrame(records)


def load_all_waste_data(
    march_path=DATA_DIR / "march_waste.csv",
    april_path=DATA_DIR / "april_waste.csv"
) -> pd.DataFrame:
    """
    Loads March and April Woods waste data into one long-format DataFrame.
    """
    files = {
        "March": Path(march_path),
        "April": Path(april_path)
    }

    dfs = []

    for month, path in files.items():
        if not path.exists():
            raise FileNotFoundError(
                f"Could not find {path}. Make sure the file is in data/."
            )

        month_df = load_one_waste_file(str(path), month)
        dfs.append(month_df)

    return pd.concat(dfs, ignore_index=True)


def summarize_waste_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregates waste data by item and creates risk scores, risk categories,
    and recommendations.
    """
    summary = df.groupby("item_name", as_index=False).agg(
        quantity_wasted=("quantity_wasted", "sum"),
        quantity_sold=("quantity_sold", "sum")
    )

    total_quantity = summary["quantity_wasted"] + summary["quantity_sold"]

    summary["waste_rate"] = summary["quantity_wasted"] / total_quantity
    summary["waste_rate"] = summary["waste_rate"].fillna(0)

    max_waste = summary["quantity_wasted"].max()
    max_sold = summary["quantity_sold"].max()

    if max_waste == 0:
        summary["waste_volume_score"] = 0
    else:
        summary["waste_volume_score"] = (
            summary["quantity_wasted"] / max_waste
        )

    if max_sold == 0:
        summary["low_sales_score"] = 0
    else:
        summary["low_sales_score"] = (
            1 - (summary["quantity_sold"] / max_sold)
        )

    summary["risk_score"] = (
        0.55 * summary["waste_rate"]
        + 0.35 * summary["waste_volume_score"]
        + 0.10 * summary["low_sales_score"]
    )

    summary["risk_category"] = summary.apply(get_risk_category, axis=1)
    summary["recommendation"] = summary.apply(make_recommendation, axis=1)

    return summary.sort_values("risk_score", ascending=False)


def get_risk_category(row: pd.Series) -> str:
    """
    Assigns a simple risk category using the combined risk score.

    Low Risk = green
    Medium Risk = yellow
    High Risk = red
    """
    if row["risk_score"] >= 0.40:
        return "High Risk"

    if row["risk_score"] >= 0.20:
        return "Medium Risk"

    return "Low Risk"


def make_recommendation(row: pd.Series) -> str:
    """
    Creates a manager recommendation based only on Woods waste/sales data.
    """
    if row["risk_category"] == "High Risk":
        if row["waste_rate"] >= 0.20 and row["quantity_sold"] < 100:
            return "Reduce production or review item demand"

        if row["waste_rate"] >= 0.20 and row["quantity_sold"] >= 100:
            return "Adjust forecasting or batch timing"

        return "Fine-tune par levels"

    if row["risk_category"] == "Medium Risk":
        return "Watch closely"

    return "Maintain current production"


# Backward-compatible function names.
# These keep older app.py versions from breaking.
def load_waste_data(file_path: str) -> pd.DataFrame:
    """
    Loads one waste file using the old function name.
    Defaults the month label to Unknown.
    """
    return load_one_waste_file(file_path, "Unknown")


def summarize_items(df: pd.DataFrame) -> pd.DataFrame:
    """
    Summarizes waste data using the old function name.
    """
    return summarize_waste_data(df)
