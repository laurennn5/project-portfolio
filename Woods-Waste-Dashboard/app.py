from pathlib import Path
import re

import altair as alt
import pandas as pd
import streamlit as st

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

def is_valid_phone(phone: str) -> bool:
    """
    Checks whether the phone number has 10 digits, or 11 digits
    starting with 1.
    """
    digits = re.sub(r"\D", "", phone)
    return len(digits) == 10 or (len(digits) == 11 and digits.startswith("1"))


def clean_phone(phone: str) -> str:
    """
    Removes all non-digit characters from a phone number.
    """
    digits = re.sub(r"\D", "", phone)

    if len(digits) == 11 and digits.startswith("1"):
        return digits[1:]

    return digits


def load_one_waste_file(file_path: str, month: str) -> pd.DataFrame:
    """
    Loads one Woods waste CSV and converts it from the original wide
    spreadsheet layout into a clean long table.

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
            wasted = pd.to_numeric(
                raw.iloc[row_idx, store_info["waste_col"]],
                errors="coerce"
            )
            sold = pd.to_numeric(
                raw.iloc[row_idx, store_info["sold_col"]],
                errors="coerce"
            )

            if pd.isna(wasted) or pd.isna(sold):
                continue

            if wasted < 0 or sold < 0:
                continue

            total_units = wasted + sold

            if total_units == 0:
                waste_rate = 0
            else:
                waste_rate = wasted / total_units

            records.append({
                "month": month,
                "store": store_info["store"],
                "item_name": item_name,
                "quantity_wasted": wasted,
                "quantity_sold": sold,
                "waste_rate": waste_rate
            })

    return pd.DataFrame(records)


def load_all_waste_data() -> pd.DataFrame:
    """
    Loads March and April Woods waste data into one long DataFrame.
    """
    files = {
        "March": DATA_DIR / "march_waste.csv",
        "April": DATA_DIR / "april_waste.csv"
    }

    dfs = []

    for month, path in files.items():
        if not path.exists():
            st.error(
                f"Could not find {path}. Make sure both March and April "
                "CSV files are inside the data folder."
            )
            st.stop()

        dfs.append(load_one_waste_file(str(path), month))

    return pd.concat(dfs, ignore_index=True)


def summarize_waste_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregates waste data by item and creates risk scores, risk labels,
    and recommendations.
    """
    summary = df.groupby("item_name", as_index=False).agg(
        quantity_wasted=("quantity_wasted", "sum"),
        quantity_sold=("quantity_sold", "sum")
    )

    summary["waste_rate"] = (
        summary["quantity_wasted"]
        / (summary["quantity_wasted"] + summary["quantity_sold"])
    )

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
    Creates a simple manager recommendation based only on Woods waste data.
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


def load_food_menu() -> pd.DataFrame:
    """
    Loads the Woods menu overview file used for customer reviews.
    """
    menu_path = DATA_DIR / "woods_menu_overview.csv"

    if not menu_path.exists():
        st.error(
            "Could not find data/woods_menu_overview.csv. "
            "Make sure the Woods menu CSV is inside the data folder."
        )
        st.stop()

    menu_df = pd.read_csv(menu_path)

    required_cols = [
        "item_name",
        "category",
        "dietary_flags",
        "vegan",
        "gluten-free",
        "fall",
        "winter",
        "spring",
        "Summer",
        "USD"
    ]

    missing_cols = [
        col for col in required_cols
        if col not in menu_df.columns
    ]

    if missing_cols:
        st.error(
            "woods_menu_overview.csv is missing these columns: "
            + ", ".join(missing_cols)
        )
        st.stop()

    menu_df["item_name"] = menu_df["item_name"].astype(str)
    menu_df["category"] = menu_df["category"].fillna("Uncategorized")
    menu_df["dietary_flags"] = menu_df["dietary_flags"].fillna("None")
    menu_df["USD"] = pd.to_numeric(menu_df["USD"], errors="coerce")

    return menu_df


def save_customer_reviews(
    phone: str,
    transaction_id: str,
    item_reviews: list[dict],
    description: str
) -> None:
    """
    Saves customer reviews to data/customer_reviews.csv.

    Each selected food item gets its own rating and structured feedback.
    The description applies to the whole receipt/order.
    """
    reviews_path = DATA_DIR / "customer_reviews.csv"
    clean_number = clean_phone(phone)

    new_reviews = pd.DataFrame([
        {
            "phone": clean_number,
            "transaction_id": transaction_id,
            "item_name": item_review["item_name"],
            "rating": item_review["rating"],
            "feedback_category": item_review["feedback_category"],
            "feedback_detail": item_review["feedback_detail"],
            "description": description
        }
        for item_review in item_reviews
    ])

    if reviews_path.exists():
        old_reviews = pd.read_csv(reviews_path)
        reviews = pd.concat([old_reviews, new_reviews], ignore_index=True)
    else:
        reviews = new_reviews

    reviews.to_csv(reviews_path, index=False)


def load_customer_reviews() -> pd.DataFrame:
    """
    Loads customer review data if it exists.
    """
    reviews_path = DATA_DIR / "customer_reviews.csv"

    if not reviews_path.exists():
        return pd.DataFrame(columns=[
            "phone",
            "transaction_id",
            "item_name",
            "rating",
            "feedback_category",
            "feedback_detail",
            "description"
        ])

    return pd.read_csv(reviews_path)


def get_customer_points(phone: str) -> int:
    """
    Calculates customer points.

    Customers earn 1 point per unique reviewed transaction/order.
    """
    reviews_df = load_customer_reviews()

    if reviews_df.empty:
        return 0

    clean_number = clean_phone(phone)

    user_reviews = reviews_df[
        reviews_df["phone"].astype(str) == clean_number
    ]

    if user_reviews.empty:
        return 0

    return user_reviews["transaction_id"].astype(str).nunique()


def transaction_already_submitted(transaction_id: str) -> bool:
    """
    Checks whether a transaction ID has already been used.
    """
    reviews_df = load_customer_reviews()

    if reviews_df.empty:
        return False

    existing_ids = reviews_df["transaction_id"].astype(str)
    return str(transaction_id) in set(existing_ids)


def summarize_customer_reviews(
    reviews_df: pd.DataFrame,
    menu_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Summarizes customer review data by food item and joins menu information.
    """
    if reviews_df.empty:
        return pd.DataFrame()

    review_summary = reviews_df.groupby("item_name", as_index=False).agg(
        avg_rating=("rating", "mean"),
        review_count=("rating", "count"),
        most_common_feedback=("feedback_category", lambda x: x.mode()[0]),
        most_common_detail=("feedback_detail", lambda x: x.mode()[0])
    )

    review_summary = review_summary.merge(
        menu_df,
        on="item_name",
        how="left"
    )

    return review_summary


def make_bar_chart(
    df: pd.DataFrame,
    x_col: str,
    x_title: str,
    title: str,
    percent_axis: bool = False
) -> alt.Chart:
    """
    Creates a horizontal color-coded bar chart.
    """
    chart_df = df.copy()

    if percent_axis:
        chart_df[x_col] = chart_df[x_col] * 100

    return (
        alt.Chart(chart_df)
        .mark_bar()
        .encode(
            x=alt.X(
                x_col,
                title=x_title,
                axis=alt.Axis(format=".1f" if percent_axis else ",.0f")
            ),
            y=alt.Y(
                "item_name",
                title="Item",
                sort="-x"
            ),
            color=alt.Color(
                "risk_category",
                title="Risk",
                scale=alt.Scale(
                    domain=[
                        "Low Risk",
                        "Medium Risk",
                        "High Risk"
                    ],
                    range=[
                        "#2E7D32",
                        "#FBC02D",
                        "#C62828"
                    ]
                )
            ),
            tooltip=[
                alt.Tooltip("item_name", title="Item"),
                alt.Tooltip("quantity_wasted", title="Wasted", format=",.0f"),
                alt.Tooltip("quantity_sold", title="Sold", format=",.0f"),
                alt.Tooltip("waste_rate", title="Waste Rate", format=".1%"),
                alt.Tooltip("risk_category", title="Risk"),
                alt.Tooltip("recommendation", title="Recommendation")
            ]
        )
        .properties(height=360, title=title)
    )


def make_scatter_chart(df: pd.DataFrame) -> alt.Chart:
    """
    Creates waste rate vs sold scatter plot.
    """
    chart_df = df.copy()
    chart_df["waste_rate_percent"] = chart_df["waste_rate"] * 100

    return (
        alt.Chart(chart_df)
        .mark_circle(opacity=0.8)
        .encode(
            x=alt.X(
                "quantity_sold",
                title="Quantity Sold",
                scale=alt.Scale(zero=False)
            ),
            y=alt.Y(
                "waste_rate_percent",
                title="Waste Rate (%)"
            ),
            size=alt.Size(
                "quantity_wasted",
                title="Quantity Wasted",
                scale=alt.Scale(range=[80, 900])
            ),
            color=alt.Color(
                "risk_category",
                title="Risk",
                scale=alt.Scale(
                    domain=[
                        "Low Risk",
                        "Medium Risk",
                        "High Risk"
                    ],
                    range=[
                        "#2E7D32",
                        "#FBC02D",
                        "#C62828"
                    ]
                )
            ),
            tooltip=[
                alt.Tooltip("item_name", title="Item"),
                alt.Tooltip("quantity_sold", title="Sold", format=",.0f"),
                alt.Tooltip("quantity_wasted", title="Wasted", format=",.0f"),
                alt.Tooltip("waste_rate", title="Waste Rate", format=".1%"),
                alt.Tooltip("risk_category", title="Risk"),
                alt.Tooltip("recommendation", title="Recommendation")
            ]
        )
        .properties(
            height=430,
            title="Waste Rate vs Quantity Sold"
        )
    )


def make_good_bad_review_chart(
    reviews_df: pd.DataFrame,
    item_name: str
) -> alt.Chart | None:
    """
    Creates a grouped bar chart showing good, neutral, and bad reviews
    by feedback category for one selected food item.
    """
    item_reviews = reviews_df[reviews_df["item_name"] == item_name].copy()

    if item_reviews.empty:
        return None

    def label_review_type(rating: int) -> str:
        if rating >= 4:
            return "Good Reviews"
        if rating <= 2:
            return "Bad Reviews"
        return "Neutral Reviews"

    item_reviews["review_type"] = item_reviews["rating"].apply(
        label_review_type
    )

    chart_data = item_reviews.groupby(
        ["feedback_category", "review_type"],
        as_index=False
    ).size()

    chart_data = chart_data.rename(columns={
        "size": "count"
    })

    return (
        alt.Chart(chart_data)
        .mark_bar()
        .encode(
            x=alt.X(
                "feedback_category:N",
                title="Feedback Category"
            ),
            y=alt.Y(
                "count:Q",
                title="Review Count"
            ),
            color=alt.Color(
                "review_type:N",
                title="Review Type",
                scale=alt.Scale(
                    domain=[
                        "Good Reviews",
                        "Neutral Reviews",
                        "Bad Reviews"
                    ],
                    range=[
                        "#2E7D32",
                        "#FBC02D",
                        "#C62828"
                    ]
                )
            ),
            xOffset="review_type:N",
            tooltip=[
                alt.Tooltip("feedback_category:N", title="Category"),
                alt.Tooltip("review_type:N", title="Review Type"),
                alt.Tooltip("count:Q", title="Count")
            ]
        )
        .properties(
            height=380,
            title=f"{item_name} Review Analysis"
        )
    )


st.set_page_config(
    page_title="Woods Coffee Waste Dashboard",
    page_icon="☕",
    layout="wide"
)

st.markdown(
    """
    <style>
    .stApp {
        background-color: #f7f1e8;
        color: #2b241f;
    }

    section[data-testid="stSidebar"] {
        background-color: #2b241f;
    }

    section[data-testid="stSidebar"] h1,
    section[data-testid="stSidebar"] h2,
    section[data-testid="stSidebar"] h3,
    section[data-testid="stSidebar"] label,
    section[data-testid="stSidebar"] p,
    section[data-testid="stSidebar"] span {
        color: #f7f1e8;
    }

    section[data-testid="stSidebar"] input {
        background-color: #fffaf2 !important;
        color: #2b241f !important;
        border: 1px solid #d8c2a6 !important;
        border-radius: 10px !important;
    }

    section[data-testid="stSidebar"] input::placeholder {
        color: #6b5a4a !important;
    }

    section[data-testid="stSidebar"] div[data-baseweb="select"] > div {
        background-color: #fffaf2 !important;
        color: #2b241f !important;
        border: 1px solid #d8c2a6 !important;
        border-radius: 10px !important;
    }

    section[data-testid="stSidebar"] div[data-baseweb="select"] span {
        color: #2b241f !important;
    }

    section[data-testid="stSidebar"] div[data-baseweb="select"] svg {
        fill: #2b241f !important;
    }

    section[data-testid="stSidebar"] div[role="radiogroup"] label span {
        color: #f7f1e8 !important;
    }

    .main-title {
        background: linear-gradient(135deg, #2b241f, #4b382b);
        padding: 2rem;
        border-radius: 22px;
        color: #f7f1e8;
        margin-bottom: 1.5rem;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
    }

    .main-title h1 {
        margin: 0;
        font-size: 2.7rem;
        font-weight: 800;
        color: #f7f1e8;
    }

    .main-title p {
        margin-top: 0.5rem;
        font-size: 1.05rem;
        color: #d9c3a5;
    }

    .insight-box {
        background-color: #efe0ca;
        padding: 1.2rem;
        border-radius: 16px;
        border-left: 7px solid #8f643d;
        margin-top: 1rem;
        color: #2b241f;
    }

    .section-card {
        background-color: #fffaf2;
        padding: 1.5rem;
        border-radius: 18px;
        border: 1px solid #e3d2ba;
        box-shadow: 0 3px 12px rgba(70, 48, 32, 0.10);
        margin-bottom: 1.25rem;
    }

    h1, h2, h3 {
        color: #2b241f;
    }

    div[data-testid="stMetric"] {
        background-color: #fffaf2;
        padding: 1rem;
        border-radius: 16px;
        border-left: 6px solid #b98b57;
        box-shadow: 0 3px 10px rgba(70, 48, 32, 0.08);
    }

    .stButton > button {
        background-color: #4b382b;
        color: #fffaf2;
        border-radius: 999px;
        border: none;
        padding: 0.6rem 1.4rem;
        font-weight: 700;
    }

    .stButton > button:hover {
        background-color: #7b593b;
        color: #fffaf2;
        border: none;
    }

    div[data-testid="stDataFrame"] {
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #e3d2ba;
    }

    .small-note {
        color: #6d5a4a;
        font-size: 0.95rem;
    }
    </style>
    """,
    unsafe_allow_html=True
)

st.markdown(
    """
    <div class="main-title">
        <h1>☕ Woods Coffee Waste & Satisfaction Dashboard</h1>
        <p>
            Store-level waste analysis plus structured customer feedback.
        </p>
    </div>
    """,
    unsafe_allow_html=True
)

waste_df = load_all_waste_data()
menu_df = load_food_menu()
reviews_df = load_customer_reviews()

st.sidebar.title("Woods Coffee")

role = st.sidebar.selectbox(
    "Who are you?",
    ["Customer", "Woods Manager"]
)

if role == "Customer":
    phone = st.sidebar.text_input("Phone number")

    if phone:
        if is_valid_phone(phone):
            page = st.sidebar.radio(
                "Customer Menu",
                ["Leave a Review", "Check Points", "Review History"]
            )
        else:
            st.sidebar.error(
                "Please enter a valid phone number (ex. 123-456-7890)"
            )
            page = "Customer Login"
    else:
        page = "Customer Login"

else:
    phone = ""

    st.sidebar.caption(
        "Prototype login. A real version would use employee accounts "
        "and role-based permissions."
    )

    manager_code = st.sidebar.text_input(
        "Manager Access",
        type="password"
    )

    if manager_code == "woods123":
        page = "Woods Dashboard"
    else:
        page = "Manager Login"


if page == "Customer Login":
    st.markdown('<div class="section-card">', unsafe_allow_html=True)
    st.header("Customer Login")
    st.write("Enter your phone number in the sidebar to leave a review.")
    st.markdown(
        '<p class="small-note">Earn feedback points after verified purchases.</p>',
        unsafe_allow_html=True
    )
    st.markdown("</div>", unsafe_allow_html=True)


elif page == "Leave a Review":
    st.markdown('<div class="section-card">', unsafe_allow_html=True)
    st.header("Leave a Food Review")

    st.write(
        "Select the food items from your order. Each item gets its own "
        "rating and feedback, while the optional description applies to "
        "the whole receipt."
    )

    transaction_id = st.text_input("Transaction number")
    st.caption(
    "Enter the unique 7-digit transaction code printed on your receipt."
    )

    categories = ["All"] + sorted(menu_df["category"].dropna().unique())

    selected_category = st.selectbox(
        "Filter menu by category",
        categories
    )

    if selected_category == "All":
        filtered_menu = menu_df.copy()
    else:
        filtered_menu = menu_df[menu_df["category"] == selected_category]

    selected_items = st.multiselect(
        "Which food items did you order?",
        sorted(filtered_menu["item_name"].unique()),
        placeholder="Search and select one or more food items"
    )

    feedback_options = {
        "Taste": ["Good flavor", "Bad flavor"],
        "Freshness": ["Very fresh", "Not fresh"],
        "Price/value": ["Good value", "Too expensive"],
        "Portion size": ["Good portion", "Bad portion"],
        "Temperature": ["Good temperature", "Bad temperature"]
    }

    item_reviews = []

    if selected_items:
        st.subheader("Review Each Item")

        for item in selected_items:
            st.markdown(f"### {item}")

            rating = st.slider(
                f"Rating for {item}",
                1,
                5,
                3,
                key=f"rating_{item}"
            )

            feedback_category = st.selectbox(
                f"Feedback category for {item}",
                list(feedback_options.keys()),
                key=f"category_{item}"
            )

            feedback_detail = st.selectbox(
                f"Feedback detail for {item}",
                feedback_options[feedback_category],
                key=f"detail_{item}"
            )

            item_reviews.append({
                "item_name": item,
                "rating": rating,
                "feedback_category": feedback_category,
                "feedback_detail": feedback_detail
            })

    description = st.text_area(
        "Optional: tell us more about the overall order"
    )

    uploaded_photo = st.file_uploader(
        "Upload receipt/photo verification",
        type=["png", "jpg", "jpeg"]
    )

    if st.button("Submit Review"):
        if not transaction_id:
            st.error("Please enter a transaction number.")
        elif transaction_already_submitted(transaction_id):
            st.error(
                "This transaction number has already been reviewed. "
                "Each receipt can only be submitted once."
            )
        elif not selected_items:
            st.error("Please select at least one food item from your order.")
        elif uploaded_photo is None:
            st.error("Please upload a receipt or photo for verification.")
        else:
            save_customer_reviews(
                phone=phone,
                transaction_id=transaction_id,
                item_reviews=item_reviews,
                description=description
            )

            st.success("Review submitted! You earned 1 feedback point.")
            st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)


elif page == "Check Points":
    st.header("Your Rewards")

    current_points = get_customer_points(phone)
    points_needed = max(12 - current_points, 0)

    col1, col2 = st.columns(2)

    col1.metric("Current Points", current_points)
    col2.metric("Points Until Reward", points_needed)

    if current_points >= 12:
        st.success(
            "You have enough points for a reward! "
            "Redeem 12 points for a free food item."
        )
    else:
        st.markdown(
            f"""
            <div class="insight-box">
                You currently have <strong>{current_points}</strong> point(s).
                Customers earn <strong>1 point per reviewed order</strong>.
                You need <strong>{points_needed}</strong> more point(s)
                to reach 12.
            </div>
            """,
            unsafe_allow_html=True
        )


elif page == "Review History":
    st.header("Review History")

    user_phone = clean_phone(phone)
    reviews_df = load_customer_reviews()

    user_reviews = reviews_df[
        reviews_df["phone"].astype(str) == user_phone
    ]

    if user_reviews.empty:
        st.write("No reviews found for this phone number yet.")
    else:
        st.dataframe(user_reviews, use_container_width=True)


elif page == "Manager Login":
    st.markdown('<div class="section-card">', unsafe_allow_html=True)
    st.header("Manager Access")

    st.write(
        "Enter the manager access code in the sidebar to view Woods Coffee "
        "waste and product performance insights."
    )

    st.info(
        "For this prototype, the access code is used only to demonstrate "
        "separate customer and manager views."
    )

    st.markdown("</div>", unsafe_allow_html=True)


elif page == "Woods Dashboard":
    st.header("Manager Dashboard")
    st.caption(
        "Use this dashboard to compare food waste by store, month, and item. "
        "The goal is to identify where production should be adjusted."
    )

    stores = sorted(waste_df["store"].unique())
    months = ["All"] + sorted(waste_df["month"].unique())

    col_filter1, col_filter2, col_filter3 = st.columns(3)

    selected_store = col_filter1.selectbox(
        "Select store location",
        stores,
        index=stores.index("All Stores") if "All Stores" in stores else 0
    )

    selected_month = col_filter2.selectbox(
        "Select month",
        months
    )

    min_sold = col_filter3.slider(
        "Minimum units sold for waste-rate ranking",
        0,
        500,
        50,
        step=25
    )

    st.caption(
        "Select a store and month to narrow the analysis. "
        "The sold threshold prevents very low-selling items from dominating "
        "the waste rate charts."
    )

    filtered_waste = waste_df[waste_df["store"] == selected_store]

    if selected_month != "All":
        filtered_waste = filtered_waste[
            filtered_waste["month"] == selected_month
        ]

    summary = summarize_waste_data(filtered_waste)

    total_wasted = summary["quantity_wasted"].sum()
    total_sold = summary["quantity_sold"].sum()

    if total_wasted + total_sold == 0:
        overall_waste_rate = 0
    else:
        overall_waste_rate = total_wasted / (total_wasted + total_sold)

    high_risk_count = (summary["risk_category"] == "High Risk").sum()

    highest_risk = summary.sort_values(
        "risk_score",
        ascending=False
    ).iloc[0]

    col1, col2, col3, col4 = st.columns(4)

    col1.metric("Total Sold", int(total_sold))
    col2.metric("Total Waste", int(total_wasted))
    col3.metric("Overall Waste Rate", f"{overall_waste_rate * 100:.1f}%")
    col4.metric("High Risk Items", int(high_risk_count))

    st.markdown(
        f"""
        <div class="insight-box">
            Viewing <strong>{selected_store}</strong>
            for <strong>{selected_month}</strong>.
            The highest-risk item is
            <strong>{highest_risk['item_name']}</strong>, with a waste rate of
            <strong>{highest_risk['waste_rate']:.1%}</strong> and
            <strong>{int(highest_risk['quantity_wasted'])}</strong>
            units wasted.
            <br><br>
            Recommended action:
            <strong>{highest_risk['recommendation']}</strong>
        </div>
        """,
        unsafe_allow_html=True
    )

    st.subheader("Product Risk Table")
    st.caption(
        "Ranks each food item using waste rate, waste volume, and sales volume. "
        "Higher risk items may need production, timing, or forecasting changes."
    )
    st.caption(
        "Risk is based on a combined score using waste rate, total waste volume, "
        "and sales volume. Low Risk items are performing efficiently, Medium Risk "
        "items should be watched, and High Risk items may need production, "
        "forecasting, or timing adjustments."
    )

    display_summary = summary.copy()
    display_summary["Waste Rate (%)"] = (
        display_summary["waste_rate"] * 100
    ).round(1)
    display_summary["Risk Score"] = display_summary["risk_score"].round(2)

    display_summary = display_summary.rename(columns={
        "item_name": "Item",
        "quantity_wasted": "Quantity Wasted",
        "quantity_sold": "Quantity Sold",
        "risk_category": "Risk Category",
        "recommendation": "Recommendation"
    })

    display_cols = [
        "Item",
        "Quantity Wasted",
        "Quantity Sold",
        "Waste Rate (%)",
        "Risk Category",
        "Risk Score",
        "Recommendation"
    ]

    st.dataframe(display_summary[display_cols], use_container_width=True)

    st.subheader("Top 10 Products by Waste Volume")
    st.caption(
        "Shows which items create the most total waste. "
        "These items have the biggest waste-reduction opportunity by volume."
    )

    top_volume = summary.sort_values(
        "quantity_wasted",
        ascending=False
    ).head(10)

    st.altair_chart(
        make_bar_chart(
            top_volume,
            "quantity_wasted",
            "Quantity Wasted",
            "Top Waste Volume Items"
        ),
        use_container_width=True
    )

    st.subheader("Top 10 Products by Waste Rate")
    st.caption(
        "Shows which items waste the highest percentage of prepared units. "
        "This helps identify items that may be overproduced relative to demand."
    )

    rate_eligible = summary[
        summary["quantity_sold"] >= min_sold
    ].sort_values("waste_rate", ascending=False).head(10)

    if rate_eligible.empty:
        st.info("No items meet the minimum sold threshold.")
    else:
        st.altair_chart(
            make_bar_chart(
                rate_eligible,
                "waste_rate",
                "Waste Rate (%)",
                "Top Waste Rate Items",
                percent_axis=True
            ),
            use_container_width=True
        )

    st.subheader("Waste Rate vs Quantity Sold")
    st.caption(
        "Compares demand and waste efficiency. "
        "Items higher on the chart have more waste, while items farther right "
        "sell more units."
    )

    st.altair_chart(
        make_scatter_chart(summary),
        use_container_width=True
    )

    if selected_month == "All":
        st.subheader("March vs April Waste Rate Change")
        st.caption(
            "Compares item waste rates between March and April. "
            "Positive change means the item became less efficient over time."
        )

        month_compare = filtered_waste.groupby(
            ["item_name", "month"],
            as_index=False
        ).agg(
            quantity_wasted=("quantity_wasted", "sum"),
            quantity_sold=("quantity_sold", "sum")
        )

        month_compare["waste_rate"] = (
            month_compare["quantity_wasted"]
            / (
                month_compare["quantity_wasted"]
                + month_compare["quantity_sold"]
            )
        )

        pivot = month_compare.pivot(
            index="item_name",
            columns="month",
            values="waste_rate"
        ).reset_index()

        if "March" in pivot.columns and "April" in pivot.columns:
            pivot["Change"] = pivot["April"] - pivot["March"]

            change_display = pivot.copy()
            change_display["March"] = (change_display["March"] * 100).round(1)
            change_display["April"] = (change_display["April"] * 100).round(1)
            change_display["Change"] = (
                change_display["Change"] * 100
            ).round(1)

            change_display = change_display.sort_values(
                "Change",
                ascending=False
            )

            st.dataframe(
                change_display.rename(columns={
                    "item_name": "Item",
                    "March": "March Waste Rate (%)",
                    "April": "April Waste Rate (%)",
                    "Change": "Change (percentage points)"
                }),
                use_container_width=True
            )

    st.header("Customer Feedback Insights")
    st.caption(
        "This section uses the separate customer review dataset. "
        "It helps explain why customers may like or dislike specific food items."
    )

    reviews_path = DATA_DIR / "customer_reviews.csv"

    if st.button("Reset Demo Reviews"):
        if reviews_path.exists():
            reviews_path.unlink()
            st.success("Demo reviews have been reset.")
            st.rerun()
        else:
            st.info("No demo reviews to reset.")

    reviews_df = load_customer_reviews()

    if reviews_df.empty:
        st.info(
            "No customer reviews have been submitted yet. "
            "Submit a review from the customer view to generate feedback "
            "insights."
        )
    else:
        review_summary = summarize_customer_reviews(reviews_df, menu_df)

        col1, col2, col3 = st.columns(3)

        col1.metric("Total Reviews", len(reviews_df))
        col2.metric("Average Rating", round(reviews_df["rating"].mean(), 2))
        col3.metric(
            "Items Reviewed",
            reviews_df["item_name"].nunique()
        )

        st.subheader("Review Summary by Item")
        st.caption(
            "Summarizes customer ratings and the most common structured feedback "
            "for each reviewed food item."
        )

        review_display = review_summary.copy()
        review_display["avg_rating"] = (
            review_display["avg_rating"]
        ).round(2)

        review_display = review_display.rename(columns={
            "item_name": "Item",
            "avg_rating": "Average Rating",
            "review_count": "Review Count",
            "most_common_feedback": "Most Common Feedback",
            "most_common_detail": "Most Common Detail",
            "category": "Category",
            "dietary_flags": "Dietary Flags",
            "vegan": "Vegan",
            "gluten-free": "Gluten-Free",
            "fall": "Fall",
            "winter": "Winter",
            "spring": "Spring",
            "Summer": "Summer",
            "USD": "Price"
        })

        st.dataframe(review_display, use_container_width=True)

        st.subheader("Feedback Category Counts")
        st.caption(
            "Shows which types of feedback customers mention most often, "
            "such as taste, freshness, price, portion size, or temperature."
        )
        feedback_counts = reviews_df["feedback_category"].value_counts()
        st.bar_chart(feedback_counts)

        st.subheader("Feedback Detail Counts")
        st.caption(
            "Breaks feedback into more specific details, such as good flavor, "
            "too expensive, not fresh, or bad portion."
        )
        detail_counts = reviews_df["feedback_detail"].value_counts()
        st.bar_chart(detail_counts)

        st.subheader("Customer Written Comments")
        st.caption(
            "Shows optional customer descriptions from submitted reviews. "
            "Managers can use these comments to understand the reason behind ratings."
        )

        description_reviews = reviews_df.copy()

        description_reviews["description"] = (
            description_reviews["description"]
            .fillna("")
            .astype(str)
            .str.strip()
        )

        description_reviews = description_reviews[
            description_reviews["description"] != ""
        ]

        if description_reviews.empty:
            st.info("No written customer descriptions have been submitted yet.")
        else:
            description_display = description_reviews[
                [
                    "transaction_id",
                    "item_name",
                    "rating",
                    "feedback_category",
                    "feedback_detail",
                    "description"
                ]
            ].rename(columns={
                "transaction_id": "Transaction ID",
                "item_name": "Item",
                "rating": "Rating",
                "feedback_category": "Feedback Category",
                "feedback_detail": "Feedback Detail",
                "description": "Customer Description"
            })

            st.dataframe(description_display, use_container_width=True)

        st.subheader("Good vs Bad Reviews by Food Item")
        st.caption(
            "Select a food item to compare positive, neutral, and negative "
            "reviews across feedback categories like taste, freshness, "
            "price/value, portion size, and temperature."
        )

        reviewed_items = sorted(reviews_df["item_name"].dropna().unique())

        selected_review_item = st.selectbox(
            "Select food item for review analysis",
            reviewed_items
        )

        good_bad_chart = make_good_bad_review_chart(
            reviews_df,
            selected_review_item
        )

        if good_bad_chart is None:
            st.info("No reviews available for this item yet.")
        else:
            st.altair_chart(good_bad_chart, use_container_width=True)

        lowest_rated = review_summary.sort_values(
            "avg_rating",
            ascending=True
        ).iloc[0]

        highest_rated = review_summary.sort_values(
            "avg_rating",
            ascending=False
        ).iloc[0]

        st.subheader("Key Feedback Insight")

        st.markdown(
            f"""
            <div class="insight-box">
                <strong>{highest_rated['item_name']}</strong> is currently
                the highest-rated reviewed item with an average rating of
                <strong>{round(highest_rated['avg_rating'], 2)} / 5</strong>.
                <br><br>
                <strong>{lowest_rated['item_name']}</strong> is currently
                the lowest-rated reviewed item with an average rating of
                <strong>{round(lowest_rated['avg_rating'], 2)} / 5</strong>.
                Its most common feedback detail is
                <strong>{lowest_rated['most_common_detail']}</strong>.
            </div>
            """,
            unsafe_allow_html=True
        )
