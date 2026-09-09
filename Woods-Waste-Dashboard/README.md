# Woods Coffee Waste & Satisfaction Dashboard

Hackathon prototype for reducing café food and drink waste by combining **customer reviews**, **sales trends**, and **inventory/waste data**.

The app has two views:

- **Customer View:** customers leave verified reviews and earn feedback points.
- **Manager View:** Woods managers see product waste, ratings, risk scores, and recommended actions.

---

## Features

- Customer review form
- Reward points prototype
- Manager-only dashboard
- Product waste/rating analysis
- Risk score and recommendation system
- Woods Coffee styled UI

---

## Project Structure

```text
woods-waste-hackathon/
├── app.py
├── analysis.py
├── requirements.txt
├── README.md
├── .gitignore
└── data/
    └── sample_data.csv
```

| File | Purpose |
|---|---|
| `app.py` | Main Streamlit website and UI |
| `analysis.py` | Waste, rating, risk score, and recommendation logic |
| `requirements.txt` | Python packages needed to run the app |
| `data/sample_data.csv` | Sample data used before the real Woods dataset |

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

Example:

```bash
git clone https://github.com/YOUR-USERNAME/woods-waste-dashboard.git
cd woods-waste-dashboard
```

---

### 2. Make sure you are in the right folder

On Windows:

```bash
dir
```

On Mac/Linux:

```bash
ls
```

You should see:

```text
app.py
analysis.py
requirements.txt
README.md
data
```

---

### 3. Install packages

Try:

```bash
pip install -r requirements.txt
```

If that does not work, try:

```bash
py -m pip install -r requirements.txt
```

or:

```bash
python -m pip install -r requirements.txt
```

---

### 4. Run the app

Try:

```bash
streamlit run app.py
```

If that does not work, try:

```bash
py -m streamlit run app.py
```

or:

```bash
python -m streamlit run app.py
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:8501
```

---

## Using the App

### Customer View

1. Select **Customer** in the sidebar.
2. Enter any phone number.
3. Use the menu to:
   - Leave a Review
   - Check Points
   - View Review History

### Woods Manager View

1. Select **Woods Manager** in the sidebar.
2. Enter the demo access code:

```text
woods123
```

3. View the manager dashboard.

The dashboard shows:

- Total reviews
- Average rating
- Total waste
- Product risk table
- Waste rate chart
- Average rating chart
- Key product insight

---

## Stopping the App

In the terminal, press:

```text
Ctrl + C
```

If asked:

```text
Terminate batch job (Y/N)?
```

Type:

```text
Y
```

Then press Enter.

---

## Team Workflow

Before making changes:

```bash
git pull
```

After making changes:

```bash
git status
git add .
git commit -m "Describe what changed"
git push
```

Example:

```bash
git add .
git commit -m "Improve manager dashboard"
git push
```

---

## Common Issues

### `pip` is not recognized

Use:

```bash
py -m pip install -r requirements.txt
```

or:

```bash
python -m pip install -r requirements.txt
```

### `streamlit` is not recognized

Use:

```bash
py -m streamlit run app.py
```

or:

```bash
python -m streamlit run app.py
```

### `FileNotFoundError: data/sample_data.csv`

Make sure `sample_data.csv` is inside the `data` folder:

```text
woods-waste-hackathon/
├── app.py
├── analysis.py
└── data/
    └── sample_data.csv
```

### Manager dashboard is not showing

Select **Woods Manager** and enter:

```text
woods123
```

---

## Hackathon Notes

The current manager login is only for the prototype. In a real deployment, Woods would use employee accounts and role-based access.

The current dataset is sample data. Once the real Woods Coffee dataset is available, replace or update `data/sample_data.csv`.

The main goal is to combine:

```text
sales data + inventory/waste data + customer review data
```

to recommend whether Woods should:

- Restock normally
- Watch an item closely
- Tweak a recipe
- Adjust portioning
- Reduce production
- Promote an item
- Consider removing an item