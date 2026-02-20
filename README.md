## Project Overview - Loan Default Analysis
This project was completed as part of the Elements of Statistical Methods course at the University of Washington. The dataset was provided by the instructor, containing borrower-level information. Motivated by the goal of applying statistical methods to real-world applications, the project showcases the process of building a model to predict loan default in R.

### Dataset Description

#### Response Variable
- Default (binary): 0 represents that an individual does not have a loan (paid back), and 1 represents that they defaulted on the loan (failed to pay it back)

#### Numeric Variables
- Age: The length of time an individual has lived (in yrs)
- LoanAmount: The amount of money borrowed
- CreditScore: The credit score of the individual with the loan
- MonthsEmployed: The number of months of employment
- NumCreditLines: The number of active credit lines (credit cards, loans, etc.)
- InterestRate: the percentage of interest relative to the principal
- LoanTerm: The length of time it takes for a loan to be paid off when the borrower makes regularly scheduled payments
- Income100k: The annual income measured in units of 100k

#### Categorical Variables 
- Education: The highest level of education attained (high
school, Bachelor’s, Master’s, PhD)
- EmploymentType: The type of employment (unemployed, self-employed, part-time, full-time)
- MaritalStatus: The marital status of an individual (single, divorced, married)
- HasCoSigner: indicates whether or not the loan has a secondary borrower, who is equally responsible for repaying the loan (yes or no)

### Modeling Approach
Since the response variable is binary, the problem of loan defaulting was framed as a classification task. Thus, logistic regression was an appropriate method to estimate default probabilities and assess how different borrower characteristics influence risk. 

We conducted a stepwise procedure, while analyzing the Akaike Information Criterion (AIC) score to compare models and p values to determine statistical significance of individual predictors.

### Results

#### Model Summary
The final resulting model found was: log(Odds(Y = 1)) = −0.6007 − 0.0365 ∗ (Age) + (3.0899 ∗ 10−6) ∗ (LoanAmount) − 0.0012 ∗ (CreditScore) − 0.0094 ∗ (MonthsEmployed) + 0.1439 ∗ (NumCreditLines) + 0.0633 ∗ (InterestRate) + 0.5475 ∗ (EmploymentTypeUnemployed) + 0.4337 ∗ (EmploymentTypeSelf − employed) + 0.2677 ∗ (EmploymentTypePart − time) − 0.0463 ∗ (MaritalStatusSingle) − 0.3047 ∗ (MaritalStatusMarried) − 0.3186 ∗ (HasCoSignerYes) − 0.6639 ∗ (Income100k)

Considering that the baseline individual in this study is an individual with no loan/default on loan. They are 0 yrs old, have a loan amount of $0, a credit score of 0, 0 months of employment, 0 credit lines, a 0%
interest rate, full-time employment, a divorced marital status, has no cosigner, and an annual income of $0:
- Age: ~0.964x odds of defaulting, which slightly decreases the odds by 3.6% for each 1-yr increase in age
- LoanAmount: 1.000003x odds of defaulting, which minutely increases the odds by 0.0003% for each additional dollar (compounded increase)
- CreditScore: ~0.999x odds of defaulting, which slightly decreases the odds by 0.1% for every 1-point increase in credit score
- MonthsEmployed: ~0.991x odds of defaulting, which slightly decreases the odds by 0.9% for each additional month employed
- NumCreditLines: ~1.155x odds of defaulting, which increases the odds by 15.5% for each additional credit line
- InterestRate: ~1.065x odds of defaulting, which increases the odds by 6.5% for each 1% increase in interest rate
- EmploymentType (full-time is the baseline category due to alphabetical order)
  + EmploymentTypeUnemployed: ~1.729x odds of defaulting, meaning that the odds of defaulting for unemployed individuals increase by 72.9% compared to full-time employed individuals
  + EmploymentTypeSelf-employed: ~1.543x odds of defaulting, meaning that the odds of defaulting for self-employed individuals increase by 54.3% compared to full-time employed individuals
  + EmploymentTypePart-time: ~1.307x odds of defaulting, meaning that the odds of defaulting for part-time individuals increase by 30.7% compared to full-time employed individuals
- MaritalStatus (divorced is the baseline category due to alphabetical order)
  + MaritalStatusSingle: ~0.955x odds of defaulting, meaning that the odds of defaulting for single individuals decrease by 4.5% compared to divorced individuals
  + MaritalStatusMarried: ~0.737x odds of defaulting, meaning that the odds of defaulting for married individuals decrease by 26.3% compared to divorced individuals
- HasCoSignerYes (No is the baseline category): ~0.727x odds of defaulting, meaning that the odds of defaulting for individuals with a cosigner decrease by 27.3% compared to those without a cosigner
- Income100k- ~0.542x odds of defaulting, which decreases the odds by 45.8% for each additional $100,000 in income

#### Justifications
NumCreditLines and the categories of EmploymentType most significantly increased the odds of default. In contrast, MaritalStatusMarried, HasCoSignerYes, and Income100k most significantly decreased the odds of default. These variables contribute most strongly to predicting the target outcome of a borrower defaulting on their loan.

These results are largely intuitive. The positive association between NumCreditLines and default risk aligns with expectations, as each additional credit line represents an additional financial obligation. As the number of outstanding debts increases, the likelihood that a borrower fails to repay all obligations likely increases as well.

The negative association for HasCoSignerYes is also reasonable. A borrower with a co-signer shares financial responsibility with another individual, which may create additional accountability. In elaboration, co-signers are often spouses, family members, or close acquaintances; defaulting could have both relational and financial consequences. Similarly, MaritalStatusMarried may reflect greater financial stability or shared household income, thereby reducing default risk.

#### Limitations
Although education level was expected to play a stronger role, Education was not retained in the final model. While higher education is often associated with higher income potential, educational attainment does not guarantee financial stability or responsible borrowing behavior. Likewise, LoanTerm was not statistically significant. While longer repayment periods might intuitively reduce financial strain, the dataset does not provide sufficient statistical evidence that the loan term meaningfully impacts default risk. This may also depend on borrower repayment behavior, which was not directly captured in the dataset.

Regarding potential overfitting, evaluation of the final model’s p-values suggests that the retained predictors are statistically meaningful. Given the relatively large sample size (n = 3500) and the inclusion of 10 predictors, the model does not appear to suffer from overfitting in this context. The balance between model complexity and explanatory power is justified for real-world financial data of this scale.
