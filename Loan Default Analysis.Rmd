---
title: "Loan Default Analysis"
author: "Lauren Yee"
date: "3/19/25"
output: github_document
---

```{r setup, include=FALSE}
knitr::opts_chunk$set(echo = TRUE)
```

# Introduction

```{r dataimport}
loanDefaultData <- read.csv("data/LoanDefaultData.csv")
```

The dataset contains loan-related information for 3,500 individuals, 12 variables including Age, LoanAmount, CreditScore, etc., and whether the individual defaulted on their loan. The target variable, Default, is binary, indicating whether a person has defaulted (1) or successfully paid off their loan (0).

The purpose of this analysis is to build a predictive logistic regression model that identifies factors significantly associated with loan default. This can help financial institutions assess the risk of lending to an individual and reduce financial losses by making more informed, data-driven decisions.

### Response:
- Default: A binary variable where 0 represents that an individual does not have a loan (paid back) and 1 represents they defaulted on the loan (failed to pay it back).

### Predictors:

- Age (numeric/expected decrease in odds): The length of time an individual has lived (in yrs)

- LoanAmount (numeric/expected no change): The amount of money borrowed

- CreditScore (numeric/expected decrease in odds): The credit score of the individual with the loan

- MonthsEmployed (numeric/expected decrease in odds): The number of months of employment

- NumCreditLines (numeric/expected increase in odds): The number of active credit lines (credit cards, loans, etc.)

- InterestRate (numeric/expected increase in odds): the percentage of interest relative to the principal

- LoanTerm (numeric/expected decrease in odds): The length of time it takes for a loan to be paid off when the borrower makes regularly scheduled payments.

- Education (categorical/expected decrease in odds): The highest level of education attained (high school, Bachelor's, Master's, PhD)

- EmploymentType (categorical/expected decrease in odds): The type of employment (unemployed, self-employed, part-time, full-time)

- Marital Status (categorical/expected decrease in odds for married and increase for single and divorced): The marital status of an individual (single, divorced, married)

- HasCoSigner (categorical/expected decrease in odds for yes): indicates whether or not the loan has a secondary borrower, who is equally responsible for repaying the loan (yes or no)

- Income100k (numeric): The annual income measured in units of 100k 

# Model Fitting

```{r model fitting}
# model=glm(NA, data=NA, family = "binomial")

model1 = glm(Default~1, data=loanDefaultData, family="binomial")
#Model 1 only includes the intercept, and will serve as the baseline model.

model2 = glm(Default~Age, data=loanDefaultData, family="binomial")
model3 = glm(Default~LoanAmount, data=loanDefaultData, family="binomial")
model4 = glm(Default~CreditScore, data=loanDefaultData, family="binomial")
model5 = glm(Default~MonthsEmployed, data=loanDefaultData, family="binomial")
model6 = glm(Default~NumCreditLines, data=loanDefaultData, family="binomial")
model7 = glm(Default~InterestRate, data=loanDefaultData, family="binomial")
model8 = glm(Default~LoanTerm, data=loanDefaultData, family="binomial")
model9 = glm(Default~Education, data=loanDefaultData, family="binomial")
model10 = glm(Default~EmploymentType, data=loanDefaultData, family="binomial")
model11 = glm(Default~MaritalStatus, data=loanDefaultData, family="binomial")
model12 = glm(Default~HasCoSigner, data=loanDefaultData, family="binomial")
model13 = glm(Default~Income100k, data=loanDefaultData, family="binomial")
#These models include the intercept and each variable respectively.

modelAll = glm(Default~Age + LoanAmount + CreditScore + MonthsEmployed + 
                 NumCreditLines + InterestRate + LoanTerm + Education + 
                 EmploymentType + MaritalStatus + HasCoSigner + 
                 Income100k, data=loanDefaultData, family="binomial")
#This model includes all of the variables, it will serve as the upper bound for the step function.

print(c(AIC(model1), AIC(model2), AIC(model3), AIC(model4), AIC(model5), 
        AIC(model6), AIC(model7), AIC(model8), AIC(model9), AIC(model10), 
        AIC(model11), AIC(model12), AIC(model13)))
```
Looking at the AIC scores of the baseline model compared to the other 12 models, the variables that improve the model from the baseline are: Age, LoanAmount, CreditScore, MonthsEmployed, NumCreditLines, InterestRate, EmploymentType, MaritalStatus, HasCoSigner, and Income100k. We will still include all of the variables for the step function, but we will take note that the variables, LoanTerm and Education increase the AIC score instead of decreasing it. 
```{r steps}
step1 = step(model1, scope=list(lower=model1, upper=modelAll), 
             direction="forward", steps=3)
print(summary(step1))
```
The Age variable is added to the model on the first iteration of the forward selection process because it improves model fit, as indicated by the lowest AIC score (2439.9). The InterestRate variable further lowers the AIC score (2383.9), so it is added to the model. Lastly, MonthsEmployed is added to the updated model, reducing the AIC score to 2351.5. Also, the p-values of each variable are significantly smaller than 0.05, which provides strong evidence that the variables are crucial in determining default. We will call this currentModel and keep updating this variable with each improvement. 
```{r}
currentModel <- glm(formula = Default ~ Age + InterestRate + MonthsEmployed, 
    family = "binomial", data = loanDefaultData)

step2 = step(currentModel, scope=list(lower=currentModel, upper=modelAll), 
             direction="forward", steps=3)
print(summary(step2))
```
- Income100k is added (AIC Score: 2333.3)
- LoanAmount is added (AIC Score: 2321.0)
- NumCreditLines is added (AIC Score: 2313.9) - We need to take a closer look at this iteration because CreditScore has the same AIC score. R choosing to add NumCreditLines instead of CreditScore does not necessarily mean it is the better choice, let's see what it does on the next step.
Again, the p-values of each variable are significantly smaller than 0.05, which provides strong evidence that the variables are crucial in determining default.
```{r}
currentModel <- glm(formula = Default ~ Age + InterestRate + MonthsEmployed + Income100k + 
    LoanAmount + NumCreditLines, family = "binomial", 
    data = loanDefaultData)

step3 = step(currentModel, scope=list(lower=currentModel, upper=modelAll), 
             direction="forward", steps=10)
print(summary(step3))
```
The step function halted its execution after 5 iterations. After NumCreditLines, the step function adds CreditScore to achieve an AIC score of 2306.4 (which was expected). 
- EmploymentType is added (AIC Score: 2300.0)
- HasCoSigner is added (AIC Score: 2293.5)
- MaritalStatus is added (AIC Score: 2291.9)
At the end, the step function checked whether adding LoanTerm or Education would improve the model and neither of them did, so they were left out in the most updated model. This is what we found before the step function. 
```{r}
currentModel <- glm(formula = Default ~ Age + InterestRate + MonthsEmployed + 
    Income100k + LoanAmount + NumCreditLines + CreditScore + 
    EmploymentType + HasCoSigner + MaritalStatus, family = "binomial", data = loanDefaultData)
print(summary(currentModel))
```
By utilizing the step function, we found that the optimal model contains the variables: Age, LoanAmount, CreditScore, MonthsEmployed, NumCreditLines, InterestRate, EmploymentType, MaritalStatus, HasCoSigner, and Income100k. 

There are 10 variables, which begs the question whether this is overfitting. Looking at the p-values of the variables, they show statistical significance except for a couple individual categories for employment and marital status---EmploymentTypePart-time and MaritalStatusSingle. This may be the result of overfitting. While this may be true and they are less statistically significant, the overall variable can be included for the optimal model due to the significance of the other categories. It is important to note that the insignificance of one category does not render the whole variable useless.

# Model Summary

The final resulting model found was: $log(Odds(Y=1)) = -0.6007 - 0.0365 * (Age) + (3.0899*{10^-6}) * (LoanAmount) - 0.0012 * (CreditScore) - 0.0094 * (MonthsEmployed) + 0.1439 * (NumCreditLines) + 0.0633 * (InterestRate) + 0.5475 * (EmploymentTypeUnemployed) + 0.4337 * (EmploymentTypeSelf-employed) + 0.2677 * (EmploymentTypePart-time) - 0.0463 * (MaritalStatusSingle) - 0.3047 * (MaritalStatusMarried) - 0.3186 * (HasCoSignerYes) - 0.6639 * (Income100k)$

The effect on the odds of each of the terms are listed below.

```{r odds}

print(exp(currentModel$coefficients["Age"]))
print(exp(currentModel$coefficients["LoanAmount"]))
print(exp(currentModel$coefficients["CreditScore"]))
print(exp(currentModel$coefficients["MonthsEmployed"]))
print(exp(currentModel$coefficients["NumCreditLines"]))
print(exp(currentModel$coefficients["InterestRate"]))
print(exp(currentModel$coefficients["EmploymentTypeUnemployed"]))
print(exp(currentModel$coefficients["EmploymentTypeSelf-employed"]))
print(exp(currentModel$coefficients["EmploymentTypePart-time"]))
print(exp(currentModel$coefficients["MaritalStatusSingle"]))
print(exp(currentModel$coefficients["MaritalStatusMarried"]))
print(exp(currentModel$coefficients["HasCoSignerYes"]))
print(exp(currentModel$coefficients["Income100k"]))
```

The baseline individual in this study is an individual with no loan---they did not default on their loan. They are 0 yrs old, have a loan amount of $0, a credit score of 0, 0 months of employment, 0 credit lines, a 0% interest rate, full-time employment, a divorced marital status, has no cosigner, and an annual income of $0. This is clearly unrealistic, but it serves as our reference of comparison.

- var1: Age - ~0.964x odds of defaulting, which slightly decreases the odds by 3.6% for each 1-yr increase in age

- var2: LoanAmount - 1.000003x odds of defaulting, which minutely increases the odds by 0.0003% for each additional dollar (compounded increase)

- var3: CreditScore - ~0.999x odds of defaulting, which slightly decreases the odds by 0.1% for every 1-pt increase in credit score

- var4: MonthsEmployed - ~0.991x odds of defaulting, which slightly decreases the odds by 0.9% for each additional month employed

- var5: NumCreditLines - ~1.155x odds of defaulting, which increases the odds by 15.5% for each additional credit line

- var6: InterestRate - ~1.065x odds of defaulting, which increases the odds by 6.5% for each 1% increase in interest rate

- var7: EmploymentType (full-time is the baseline category due to alphabetical order)

EmploymentTypeUnemployed - ~1.729x odds of defaulting, meaning that the odds of defaulting for unemployed individuals increase by 72.9% compared to full-time employed individuals

EmploymentTypeSelf-employed - ~1.543x odds of defaulting, meaning that the odds of defaulting for self-employed individuals increase by 54.3% compared to full-time employed individuals

EmploymentTypePart-time - ~1.307x odds of defaulting, meaning that the odds of defaulting for part-time individuals increase by 30.7% compared to full-time employed individuals

- var8: MaritalStatus (divorced is the baseline category due to alphabetical order)

MaritalStatusSingle - ~0.955x odds of defaulting, meaning that the odds of defaulting for single individuals decrease by 4.5% compared to divorced individuals

MaritalStatusMarried - ~0.737x odds of defaulting, meaning that the odds of defaulting for married individuals decrease by 26.3% compared to divorced individuals

- var9: HasCoSignerYes (No is the baseline category) - ~0.727x odds of defaulting, meaning that the odds of defaulting for individuals with a cosigner decrease by 27.3% compared to those without a cosigner

- var10: Income100k - ~0.542x odds of defaulting, which decreases the odds by 45.8% for each additional $100,000 in income

# Conclusion

The variables NumCreditLines and the categories of EmploymentType most significantly increased the odds of default. Additionally, MaritalStatusMarried, HasCoSignerYes, and Income100k most significantly decreased the odds of default. These variables contribute most strongly to predicting the target outcome — the probability that a borrower defaults on their loan.

These results are largely intuitive. The positive association between NumCreditLines and default risk aligns with expectations, as each additional credit line represents an additional financial obligation. As the number of outstanding debts increases, the likelihood that a borrower struggles to repay all obligations may increase as well.

The negative association for HasCoSignerYes is also reasonable. A borrower with a co-signer shares financial responsibility with another individual, which may create additional accountability. Because co-signers are often spouses, family members, or close acquaintances, defaulting could have relational as well as financial consequences. Similarly, MaritalStatusMarried may reflect increased financial stability or shared household income, contributing to reduced default risk.

Although I initially expected education level to play a stronger role, Education was not retained in the final model. While higher education is often associated with higher income potential, educational attainment does not guarantee financial stability or responsible borrowing behavior. Likewise, LoanTerm was not statistically significant. While longer repayment periods might intuitively reduce financial strain, the dataset does not provide sufficient statistical evidence that loan term meaningfully impacts default risk. This may also depend on borrower repayment behavior, which was not directly captured in the dataset.

Regarding potential overfitting, evaluation of the final model’s p-values suggests that the retained predictors are statistically meaningful. Given the relatively large sample size (n = 3500) and the inclusion of approximately 10 predictors, the model does not appear to suffer from overfitting in this context. The balance between model complexity and explanatory power is justified for real-world financial data of this scale.
