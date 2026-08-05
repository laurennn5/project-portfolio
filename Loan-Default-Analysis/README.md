# Loan Default Analysis

## Project Overview

This project analyzes borrower-level data to identify financial and demographic characteristics associated with loan default. Using logistic regression in R, I evaluated individual predictors, applied forward stepwise selection using Akaike Information Criterion (AIC), and interpreted the final model through odds ratios.

The dataset contains 3,500 borrower records and 12 candidate predictors related to income, employment, credit history, loan characteristics, and personal demographics.

## Research Question

Which borrower and loan characteristics are most strongly associated with the probability of loan default?

## Tools and Methods

- R and R Markdown
- Logistic regression
- Forward stepwise variable selection
- Akaike Information Criterion (AIC)
- Statistical significance testing
- Odds-ratio interpretation

## Key Findings

The final logistic regression model retained 10 predictors. The strongest associations included:

- More active credit lines were associated with higher odds of default.
- Unemployed, self-employed, and part-time borrowers had higher estimated odds of default than full-time borrowers.
- Higher income was associated with substantially lower odds of default.
- Having a co-signer was associated with lower odds of default.
- Married borrowers had lower estimated odds of default than divorced borrowers.

These findings suggest that income, employment stability, existing credit obligations, and access to financial support are important factors associated with borrower default risk.

## Dataset

The response variable is:

- `Default`: `0` indicates that the borrower did not default, while `1` indicates that the borrower defaulted.

The candidate predictors are:

- `Age`: Borrower age in years
- `LoanAmount`: Amount of money borrowed
- `CreditScore`: Borrower credit score
- `MonthsEmployed`: Number of months employed
- `NumCreditLines`: Number of active credit lines
- `InterestRate`: Loan interest rate
- `LoanTerm`: Scheduled repayment period
- `Education`: Highest level of education attained
- `EmploymentType`: Employment category
- `MaritalStatus`: Borrower marital status
- `HasCoSigner`: Whether the loan has a co-signer
- `Income100k`: Annual income measured in units of $100,000

## Data Import

```{r dataimport}
loanDefaultData <- read.csv("data/LoanDefaultData.csv")
```
