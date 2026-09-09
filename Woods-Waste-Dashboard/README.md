# Woods Coffee Waste & Satisfaction Dashboard

Interactive Streamlit dashboard developed for Everybody Hacks 2026 to help Woods Coffee analyze product waste, sales performance, and structured customer feedback.

The application provides two views:

- **Customer View:** Customers can submit receipt-supported food reviews, provide structured feedback, view review history, and earn feedback points.
- **Manager View:** Woods managers can analyze waste and sales performance across stores and months, identify high-risk products, review recommended actions, and explore customer satisfaction data.

---

## Features

- Store- and month-level waste analysis
- Product waste-rate and waste-volume tracking
- Custom product risk scoring
- Data-driven manager recommendations
- March vs. April performance comparison
- Structured customer review system
- Receipt-supported review submissions
- Customer reward points prototype
- Customer review history
- Product satisfaction analysis
- Interactive Altair visualizations
- Separate customer and manager interfaces
- Woods Coffee-inspired Streamlit UI

---

## Project Structure

```text
Woods-Waste-Dashboard/
├── app.py
├── analysis.py
├── requirements.txt
├── README.md
├── .gitignore
└── data/
    ├── march_waste.csv
    ├── april_waste.csv
    ├── woods_menu_overview.csv
    └── customer_reviews.csv
```

| File | Purpose |
|---|---|
| `app.py` | Main Streamlit application, interface, customer review workflow, and manager dashboard |
| `analysis.py` | Waste calculations, risk scoring, risk categorization, and manager recommendation logic |
| `requirements.txt` | Python packages required to run the application |
| `data/march_waste.csv` | March product waste and sales data |
| `data/april_waste.csv` | April product waste and sales data |
| `data/woods_menu_overview.csv` | Menu information used for customer review functionality |
| `data/customer_reviews.csv` | Stores submitted customer review data when reviews are created |

---

## Technologies

- Python
- Streamlit
- Pandas
- Altair
- Data cleaning and transformation
- Interactive dashboard development
- Business analytics
- Data visualization

---

## Waste Analysis

The dashboard processes store-level sales and waste data and converts the original wide-format spreadsheets into a clean long-format dataset.

For each product, the application calculates:

- Quantity sold
- Quantity wasted
- Waste rate
- Waste-volume score
- Low-sales score
- Combined risk score
- Risk category
- Recommended manager action

Waste rate is calculated as:

```text
Quantity Wasted / (Quantity Wasted + Quantity Sold)
```

Products are classified as:

- **Low Risk**
- **Medium Risk**
- **High Risk**

---

## Risk Scoring

The product risk score combines three operational measures:

```text
55% Waste Rate
+ 35% Waste Volume Score
+ 10% Low Sales Score
```

This approach helps distinguish between products that have a high percentage of waste and products that create a large amount of total waste.

Based on the resulting risk category and product performance, the dashboard can recommend actions such as:

- Maintain current production
- Watch closely
- Fine-tune par levels
- Adjust forecasting or batch timing
- Reduce production or review item demand

---

## Manager Dashboard

The manager dashboard allows users to filter performance by:

- Store location
- Month
- Minimum units sold

The dashboard displays key metrics including:

- Total units sold
- Total units wasted
- Overall waste rate
- Number of high-risk products
- Highest-risk product and recommended action

Additional visualizations and analysis include:

- Product risk table
- Top 10 products by waste volume
- Top 10 products by waste rate
- Waste rate vs. quantity sold
- March vs. April waste-rate comparison
- Customer feedback summaries
- Good, neutral, and bad review analysis by product

---

## Customer Feedback System

The customer side of the application allows customers to submit structured feedback about food items from their order.

Customers provide:

- Phone number
- Transaction number
- Food item
- 1–5 rating
- Feedback category
- Feedback detail
- Optional written comments
- Receipt or photo upload

Feedback categories include:

- Taste
- Freshness
- Price/value
- Portion size
- Temperature

The application prevents the same transaction number from being submitted more than once.

---

## Customer Rewards Prototype

Customers earn:

```text
1 point per unique reviewed transaction
```

The prototype reward threshold is:

```text
12 points = 1 free food item
```

Customers can also view their current points and review history within the application.

---

## Customer Satisfaction Analysis

Managers can review customer feedback separately from the waste-risk calculation.

The dashboard summarizes:

- Average product rating
- Number of reviews
- Most common feedback category
- Most common feedback detail
- Written customer comments
- Highest-rated product
- Lowest-rated product

Managers can also select an individual food item to compare:

- Good reviews
- Neutral reviews
- Bad reviews

across feedback categories such as taste, freshness, price/value, portion size, and temperature.

---

## Decision-Support Logic

The dashboard combines:

```text
sales data + waste data + customer feedback
```

to provide managers with a broader view of product performance.

Waste and sales data are used to identify operational inefficiencies and generate product risk scores.

Customer feedback is analyzed separately to provide additional context around why customers may prefer or dislike specific products.

Together, these insights can help managers make more informed decisions about:

- Production quantities
- Forecasting
- Batch timing
- Par levels
- Product demand
- Customer satisfaction

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/laurennn5/project-portfolio.git
cd project-portfolio/Woods-Waste-Dashboard
```

### 2. Install required packages

```bash
pip install -r requirements.txt
```

If `pip` is not recognized on Windows, use:

```bash
py -m pip install -r requirements.txt
```

or:

```bash
python -m pip install -r requirements.txt
```

### 3. Run the application

```bash
streamlit run app.py
```

If `streamlit` is not recognized on Windows, use:

```bash
py -m streamlit run app.py
```

or:

```bash
python -m streamlit run app.py
```

The application will usually open at:

```text
http://localhost:8501
```

---

## Using the App

### Customer View

1. Select **Customer** in the sidebar.
2. Enter a valid phone number.
3. Choose from:
   - Leave a Review
   - Check Points
   - Review History

### Woods Manager View

1. Select **Woods Manager** in the sidebar.
2. Enter the prototype access code:

```text
woods123
```

3. Explore the waste, sales, risk, and customer satisfaction dashboard.

---

## Prototype Limitations

This application was developed as a hackathon prototype rather than a production system.

The manager access code is used only to demonstrate separate customer and manager views. A production deployment would use secure employee authentication and role-based access controls.

Receipt/photo uploads are required as part of the prototype review workflow, but the application does not currently perform automated receipt verification.

Customer review data is stored locally in a CSV file rather than in a production database.

The risk score is a custom decision-support metric developed for the prototype and should not be interpreted as a statistically validated predictive model.

---

## Project Context

Developed for **Everybody Hacks 2026**, a hackathon hosted by **GEODAT, Data Science Society, iQueeries, and Notion at UW**.

Led a four-person team by coordinating project direction, dividing responsibilities, and contributing to the dashboard's data analysis, decision-support logic, and implementation.
