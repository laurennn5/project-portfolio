Loan Default Analysis
================
Lauren Yee
3/19/25

# Introduction

``` r
loanDefaultData <- read.csv("data/LoanDefaultData.csv")
```

The dataset contains loan-related information for 3,500 individuals, 12
variables including Age, LoanAmount, CreditScore, etc., and whether the
individual defaulted on their loan. The target variable, Default, is
binary, indicating whether a person has defaulted (1) or successfully
paid off their loan (0).

The purpose of this analysis is to build a predictive logistic
regression model that identifies factors significantly associated with
loan default. This can help financial institutions assess the risk of
lending to an individual and reduce financial losses by making more
informed, data-driven decisions.

### Response:

- Default: A binary variable where 0 represents that an individual does
  not have a loan (paid back) and 1 represents they defaulted on the
  loan (failed to pay it back).

### Predictors:

- Age (numeric/expected decrease in odds): The length of time an
  individual has lived (in yrs)

- LoanAmount (numeric/expected no change): The amount of money borrowed

- CreditScore (numeric/expected decrease in odds): The credit score of
  the individual with the loan

- MonthsEmployed (numeric/expected decrease in odds): The number of
  months of employment

- NumCreditLines (numeric/expected increase in odds): The number of
  active credit lines (credit cards, loans, etc.)

- InterestRate (numeric/expected increase in odds): the percentage of
  interest relative to the principal

- LoanTerm (numeric/expected decrease in odds): The length of time it
  takes for a loan to be paid off when the borrower makes regularly
  scheduled payments.

- Education (categorical/expected decrease in odds): The highest level
  of education attained (high school, Bachelor’s, Master’s, PhD)

- EmploymentType (categorical/expected decrease in odds): The type of
  employment (unemployed, self-employed, part-time, full-time)

- Marital Status (categorical/expected decrease in odds for married and
  increase for single and divorced): The marital status of an individual
  (single, divorced, married)

- HasCoSigner (categorical/expected decrease in odds for yes): indicates
  whether or not the loan has a secondary borrower, who is equally
  responsible for repaying the loan (yes or no)

- Income100k (numeric): The annual income measured in units of 100k

# Model Fitting

``` r
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

    ##  [1] 2526.312 2439.910 2515.238 2518.864 2495.118 2519.992 2472.932 2527.607
    ##  [9] 2529.485 2522.247 2525.200 2519.482 2509.274

Looking at the AIC scores of the baseline model compared to the other 12
models, the variables that improve the model from the baseline are: Age,
LoanAmount, CreditScore, MonthsEmployed, NumCreditLines, InterestRate,
EmploymentType, MaritalStatus, HasCoSigner, and Income100k. We will
still include all of the variables for the step function, but we will
take note that the variables, LoanTerm and Education increase the AIC
score instead of decreasing it.

``` r
step1 = step(model1, scope=list(lower=model1, upper=modelAll), 
             direction="forward", steps=3)
```

    ## Start:  AIC=2526.31
    ## Default ~ 1
    ## 
    ##                  Df Deviance    AIC
    ## + Age             1   2435.9 2439.9
    ## + InterestRate    1   2468.9 2472.9
    ## + MonthsEmployed  1   2491.1 2495.1
    ## + Income100k      1   2505.3 2509.3
    ## + LoanAmount      1   2511.2 2515.2
    ## + CreditScore     1   2514.9 2518.9
    ## + HasCoSigner     1   2515.5 2519.5
    ## + NumCreditLines  1   2516.0 2520.0
    ## + EmploymentType  3   2514.2 2522.2
    ## + MaritalStatus   2   2519.2 2525.2
    ## <none>                2524.3 2526.3
    ## + LoanTerm        1   2523.6 2527.6
    ## + Education       3   2521.5 2529.5
    ## 
    ## Step:  AIC=2439.91
    ## Default ~ Age
    ## 
    ##                  Df Deviance    AIC
    ## + InterestRate    1   2377.9 2383.9
    ## + MonthsEmployed  1   2401.2 2407.2
    ## + Income100k      1   2416.9 2422.9
    ## + LoanAmount      1   2421.6 2427.6
    ## + CreditScore     1   2425.9 2431.9
    ## + NumCreditLines  1   2426.9 2432.9
    ## + HasCoSigner     1   2427.5 2433.5
    ## + EmploymentType  3   2426.4 2436.4
    ## + MaritalStatus   2   2429.2 2437.2
    ## <none>                2435.9 2439.9
    ## + LoanTerm        1   2435.2 2441.2
    ## + Education       3   2432.6 2442.6
    ## 
    ## Step:  AIC=2383.89
    ## Default ~ Age + InterestRate
    ## 
    ##                  Df Deviance    AIC
    ## + MonthsEmployed  1   2343.5 2351.5
    ## + Income100k      1   2358.9 2366.9
    ## + LoanAmount      1   2364.1 2372.1
    ## + NumCreditLines  1   2368.3 2376.3
    ## + CreditScore     1   2368.7 2376.7
    ## + EmploymentType  3   2366.6 2378.6
    ## + HasCoSigner     1   2371.3 2379.3
    ## + MaritalStatus   2   2371.2 2381.2
    ## <none>                2377.9 2383.9
    ## + LoanTerm        1   2377.3 2385.3
    ## + Education       3   2373.7 2385.7
    ## 
    ## Step:  AIC=2351.52
    ## Default ~ Age + InterestRate + MonthsEmployed

``` r
print(summary(step1))
```

    ## 
    ## Call:
    ## glm(formula = Default ~ Age + InterestRate + MonthsEmployed, 
    ##     family = "binomial", data = loanDefaultData)
    ## 
    ## Coefficients:
    ##                 Estimate Std. Error z value Pr(>|z|)    
    ## (Intercept)    -0.972515   0.217091  -4.480 7.47e-06 ***
    ## Age            -0.035274   0.003798  -9.287  < 2e-16 ***
    ## InterestRate    0.062776   0.008456   7.424 1.14e-13 ***
    ## MonthsEmployed -0.009354   0.001616  -5.789 7.08e-09 ***
    ## ---
    ## Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
    ## 
    ## (Dispersion parameter for binomial family taken to be 1)
    ## 
    ##     Null deviance: 2524.3  on 3499  degrees of freedom
    ## Residual deviance: 2343.5  on 3496  degrees of freedom
    ## AIC: 2351.5
    ## 
    ## Number of Fisher Scoring iterations: 5

The Age variable is added to the model on the first iteration of the
forward selection process because it improves model fit, as indicated by
the lowest AIC score (2439.9). The InterestRate variable further lowers
the AIC score (2383.9), so it is added to the model. Lastly,
MonthsEmployed is added to the updated model, reducing the AIC score to
2351.5. Also, the p-values of each variable are significantly smaller
than 0.05, which provides strong evidence that the variables are crucial
in determining default. We will call this currentModel and keep updating
this variable with each improvement.

``` r
currentModel <- glm(formula = Default ~ Age + InterestRate + MonthsEmployed, 
    family = "binomial", data = loanDefaultData)

step2 = step(currentModel, scope=list(lower=currentModel, upper=modelAll), 
             direction="forward", steps=3)
```

    ## Start:  AIC=2351.52
    ## Default ~ Age + InterestRate + MonthsEmployed
    ## 
    ##                  Df Deviance    AIC
    ## + Income100k      1   2323.3 2333.3
    ## + LoanAmount      1   2329.8 2339.8
    ## + NumCreditLines  1   2334.3 2344.3
    ## + CreditScore     1   2334.9 2344.9
    ## + EmploymentType  3   2331.8 2345.8
    ## + HasCoSigner     1   2337.0 2347.0
    ## + MaritalStatus   2   2337.8 2349.8
    ## <none>                2343.5 2351.5
    ## + LoanTerm        1   2342.8 2352.8
    ## + Education       3   2339.8 2353.8
    ## 
    ## Step:  AIC=2333.3
    ## Default ~ Age + InterestRate + MonthsEmployed + Income100k
    ## 
    ##                  Df Deviance    AIC
    ## + LoanAmount      1   2309.0 2321.0
    ## + NumCreditLines  1   2313.7 2325.7
    ## + CreditScore     1   2314.7 2326.7
    ## + HasCoSigner     1   2315.6 2327.6
    ## + EmploymentType  3   2311.9 2327.9
    ## + MaritalStatus   2   2318.1 2332.1
    ## <none>                2323.3 2333.3
    ## + LoanTerm        1   2322.5 2334.5
    ## + Education       3   2320.2 2336.2
    ## 
    ## Step:  AIC=2321.01
    ## Default ~ Age + InterestRate + MonthsEmployed + Income100k + 
    ##     LoanAmount
    ## 
    ##                  Df Deviance    AIC
    ## + NumCreditLines  1   2299.9 2313.9
    ## + CreditScore     1   2299.9 2313.9
    ## + EmploymentType  3   2296.7 2314.7
    ## + HasCoSigner     1   2301.6 2315.6
    ## + MaritalStatus   2   2303.5 2319.5
    ## <none>                2309.0 2321.0
    ## + LoanTerm        1   2308.3 2322.3
    ## + Education       3   2305.9 2323.9
    ## 
    ## Step:  AIC=2313.87
    ## Default ~ Age + InterestRate + MonthsEmployed + Income100k + 
    ##     LoanAmount + NumCreditLines

``` r
print(summary(step2))
```

    ## 
    ## Call:
    ## glm(formula = Default ~ Age + InterestRate + MonthsEmployed + 
    ##     Income100k + LoanAmount + NumCreditLines, family = "binomial", 
    ##     data = loanDefaultData)
    ## 
    ## Coefficients:
    ##                  Estimate Std. Error z value Pr(>|z|)    
    ## (Intercept)    -1.197e+00  2.927e-01  -4.089 4.32e-05 ***
    ## Age            -3.596e-02  3.841e-03  -9.363  < 2e-16 ***
    ## InterestRate    6.334e-02  8.538e-03   7.419 1.18e-13 ***
    ## MonthsEmployed -9.516e-03  1.628e-03  -5.847 5.00e-09 ***
    ## Income100k     -6.466e-01  1.418e-01  -4.559 5.14e-06 ***
    ## LoanAmount      2.898e-06  7.833e-07   3.701 0.000215 ***
    ## NumCreditLines  1.480e-01  4.910e-02   3.014 0.002581 ** 
    ## ---
    ## Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
    ## 
    ## (Dispersion parameter for binomial family taken to be 1)
    ## 
    ##     Null deviance: 2524.3  on 3499  degrees of freedom
    ## Residual deviance: 2299.9  on 3493  degrees of freedom
    ## AIC: 2313.9
    ## 
    ## Number of Fisher Scoring iterations: 5

- Income100k is added (AIC Score: 2333.3)
- LoanAmount is added (AIC Score: 2321.0)
- NumCreditLines is added (AIC Score: 2313.9) - We need to take a closer
  look at this iteration because CreditScore has the same AIC score. R
  choosing to add NumCreditLines instead of CreditScore does not
  necessarily mean it is the better choice, let’s see what it does on
  the next step. Again, the p-values of each variable are significantly
  smaller than 0.05, which provides strong evidence that the variables
  are crucial in determining default.

``` r
currentModel <- glm(formula = Default ~ Age + InterestRate + MonthsEmployed + Income100k + 
    LoanAmount + NumCreditLines, family = "binomial", 
    data = loanDefaultData)

step3 = step(currentModel, scope=list(lower=currentModel, upper=modelAll), 
             direction="forward", steps=10)
```

    ## Start:  AIC=2313.87
    ## Default ~ Age + InterestRate + MonthsEmployed + Income100k + 
    ##     LoanAmount + NumCreditLines
    ## 
    ##                  Df Deviance    AIC
    ## + CreditScore     1   2290.4 2306.4
    ## + EmploymentType  3   2288.2 2308.2
    ## + HasCoSigner     1   2292.3 2308.3
    ## + MaritalStatus   2   2294.7 2312.7
    ## <none>                2299.9 2313.9
    ## + LoanTerm        1   2299.2 2315.2
    ## + Education       3   2296.6 2316.6
    ## 
    ## Step:  AIC=2306.43
    ## Default ~ Age + InterestRate + MonthsEmployed + Income100k + 
    ##     LoanAmount + NumCreditLines + CreditScore
    ## 
    ##                  Df Deviance    AIC
    ## + EmploymentType  3   2278.0 2300.0
    ## + HasCoSigner     1   2282.3 2300.3
    ## + MaritalStatus   2   2285.2 2305.2
    ## <none>                2290.4 2306.4
    ## + LoanTerm        1   2289.7 2307.7
    ## + Education       3   2286.9 2308.9
    ## 
    ## Step:  AIC=2299.99
    ## Default ~ Age + InterestRate + MonthsEmployed + Income100k + 
    ##     LoanAmount + NumCreditLines + CreditScore + EmploymentType
    ## 
    ##                 Df Deviance    AIC
    ## + HasCoSigner    1   2269.5 2293.5
    ## + MaritalStatus  2   2272.2 2298.2
    ## <none>               2278.0 2300.0
    ## + LoanTerm       1   2277.2 2301.2
    ## + Education      3   2274.3 2302.3
    ## 
    ## Step:  AIC=2293.54
    ## Default ~ Age + InterestRate + MonthsEmployed + Income100k + 
    ##     LoanAmount + NumCreditLines + CreditScore + EmploymentType + 
    ##     HasCoSigner
    ## 
    ##                 Df Deviance    AIC
    ## + MaritalStatus  2   2263.9 2291.9
    ## <none>               2269.5 2293.5
    ## + LoanTerm       1   2268.7 2294.7
    ## + Education      3   2266.0 2296.0
    ## 
    ## Step:  AIC=2291.94
    ## Default ~ Age + InterestRate + MonthsEmployed + Income100k + 
    ##     LoanAmount + NumCreditLines + CreditScore + EmploymentType + 
    ##     HasCoSigner + MaritalStatus
    ## 
    ##             Df Deviance    AIC
    ## <none>           2263.9 2291.9
    ## + LoanTerm   1   2262.9 2292.9
    ## + Education  3   2260.5 2294.5

``` r
print(summary(step3))
```

    ## 
    ## Call:
    ## glm(formula = Default ~ Age + InterestRate + MonthsEmployed + 
    ##     Income100k + LoanAmount + NumCreditLines + CreditScore + 
    ##     EmploymentType + HasCoSigner + MaritalStatus, family = "binomial", 
    ##     data = loanDefaultData)
    ## 
    ## Coefficients:
    ##                               Estimate Std. Error z value Pr(>|z|)    
    ## (Intercept)                 -6.007e-01  3.821e-01  -1.572 0.115868    
    ## Age                         -3.647e-02  3.891e-03  -9.373  < 2e-16 ***
    ## InterestRate                 6.328e-02  8.596e-03   7.362 1.81e-13 ***
    ## MonthsEmployed              -9.383e-03  1.644e-03  -5.708 1.14e-08 ***
    ## Income100k                  -6.639e-01  1.431e-01  -4.639 3.50e-06 ***
    ## LoanAmount                   3.090e-06  7.905e-07   3.909 9.28e-05 ***
    ## NumCreditLines               1.439e-01  4.944e-02   2.911 0.003598 ** 
    ## CreditScore                 -1.152e-03  3.503e-04  -3.290 0.001004 ** 
    ## EmploymentTypePart-time      2.677e-01  1.654e-01   1.619 0.105548    
    ## EmploymentTypeSelf-employed  4.337e-01  1.606e-01   2.700 0.006927 ** 
    ## EmploymentTypeUnemployed     5.475e-01  1.615e-01   3.390 0.000698 ***
    ## HasCoSignerYes              -3.186e-01  1.111e-01  -2.868 0.004127 ** 
    ## MaritalStatusMarried        -3.047e-01  1.376e-01  -2.214 0.026857 *  
    ## MaritalStatusSingle         -4.632e-02  1.304e-01  -0.355 0.722517    
    ## ---
    ## Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
    ## 
    ## (Dispersion parameter for binomial family taken to be 1)
    ## 
    ##     Null deviance: 2524.3  on 3499  degrees of freedom
    ## Residual deviance: 2263.9  on 3486  degrees of freedom
    ## AIC: 2291.9
    ## 
    ## Number of Fisher Scoring iterations: 5

The step function halted its execution after 5 iterations. After
NumCreditLines, the step function adds CreditScore to achieve an AIC
score of 2306.4 (which was expected). - EmploymentType is added (AIC
Score: 2300.0) - HasCoSigner is added (AIC Score: 2293.5) -
MaritalStatus is added (AIC Score: 2291.9) At the end, the step function
checked whether adding LoanTerm or Education would improve the model and
neither of them did, so they were left out in the most updated model.
This is what we found before the step function.

``` r
currentModel <- glm(formula = Default ~ Age + InterestRate + MonthsEmployed + 
    Income100k + LoanAmount + NumCreditLines + CreditScore + 
    EmploymentType + HasCoSigner + MaritalStatus, family = "binomial", data = loanDefaultData)
print(summary(currentModel))
```

    ## 
    ## Call:
    ## glm(formula = Default ~ Age + InterestRate + MonthsEmployed + 
    ##     Income100k + LoanAmount + NumCreditLines + CreditScore + 
    ##     EmploymentType + HasCoSigner + MaritalStatus, family = "binomial", 
    ##     data = loanDefaultData)
    ## 
    ## Coefficients:
    ##                               Estimate Std. Error z value Pr(>|z|)    
    ## (Intercept)                 -6.007e-01  3.821e-01  -1.572 0.115868    
    ## Age                         -3.647e-02  3.891e-03  -9.373  < 2e-16 ***
    ## InterestRate                 6.328e-02  8.596e-03   7.362 1.81e-13 ***
    ## MonthsEmployed              -9.383e-03  1.644e-03  -5.708 1.14e-08 ***
    ## Income100k                  -6.639e-01  1.431e-01  -4.639 3.50e-06 ***
    ## LoanAmount                   3.090e-06  7.905e-07   3.909 9.28e-05 ***
    ## NumCreditLines               1.439e-01  4.944e-02   2.911 0.003598 ** 
    ## CreditScore                 -1.152e-03  3.503e-04  -3.290 0.001004 ** 
    ## EmploymentTypePart-time      2.677e-01  1.654e-01   1.619 0.105548    
    ## EmploymentTypeSelf-employed  4.337e-01  1.606e-01   2.700 0.006927 ** 
    ## EmploymentTypeUnemployed     5.475e-01  1.615e-01   3.390 0.000698 ***
    ## HasCoSignerYes              -3.186e-01  1.111e-01  -2.868 0.004127 ** 
    ## MaritalStatusMarried        -3.047e-01  1.376e-01  -2.214 0.026857 *  
    ## MaritalStatusSingle         -4.632e-02  1.304e-01  -0.355 0.722517    
    ## ---
    ## Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
    ## 
    ## (Dispersion parameter for binomial family taken to be 1)
    ## 
    ##     Null deviance: 2524.3  on 3499  degrees of freedom
    ## Residual deviance: 2263.9  on 3486  degrees of freedom
    ## AIC: 2291.9
    ## 
    ## Number of Fisher Scoring iterations: 5

By utilizing the step function, we found that the optimal model contains
the variables: Age, LoanAmount, CreditScore, MonthsEmployed,
NumCreditLines, InterestRate, EmploymentType, MaritalStatus,
HasCoSigner, and Income100k.

There are 10 variables, which begs the question whether this is
overfitting. Looking at the p-values of the variables, they show
statistical significance except for a couple individual categories for
employment and marital status—EmploymentTypePart-time and
MaritalStatusSingle. This may be the result of overfitting. While this
may be true and they are less statistically significant, the overall
variable can be included for the optimal model due to the significance
of the other categories. It is important to note that the insignificance
of one category does not render the whole variable useless.

# Model Summary

The final resulting model found was:
$log(Odds(Y=1)) = -0.6007 - 0.0365 * (Age) + (3.0899*{10^-6}) * (LoanAmount) - 0.0012 * (CreditScore) - 0.0094 * (MonthsEmployed) + 0.1439 * (NumCreditLines) + 0.0633 * (InterestRate) + 0.5475 * (EmploymentTypeUnemployed) + 0.4337 * (EmploymentTypeSelf-employed) + 0.2677 * (EmploymentTypePart-time) - 0.0463 * (MaritalStatusSingle) - 0.3047 * (MaritalStatusMarried) - 0.3186 * (HasCoSignerYes) - 0.6639 * (Income100k)$

The effect on the odds of each of the terms are listed below.

``` r
print(exp(currentModel$coefficients["Age"]))
```

    ##       Age 
    ## 0.9641862

``` r
print(exp(currentModel$coefficients["LoanAmount"]))
```

    ## LoanAmount 
    ##   1.000003

``` r
print(exp(currentModel$coefficients["CreditScore"]))
```

    ## CreditScore 
    ##   0.9988485

``` r
print(exp(currentModel$coefficients["MonthsEmployed"]))
```

    ## MonthsEmployed 
    ##      0.9906605

``` r
print(exp(currentModel$coefficients["NumCreditLines"]))
```

    ## NumCreditLines 
    ##       1.154824

``` r
print(exp(currentModel$coefficients["InterestRate"]))
```

    ## InterestRate 
    ##     1.065326

``` r
print(exp(currentModel$coefficients["EmploymentTypeUnemployed"]))
```

    ## EmploymentTypeUnemployed 
    ##                 1.728928

``` r
print(exp(currentModel$coefficients["EmploymentTypeSelf-employed"]))
```

    ## EmploymentTypeSelf-employed 
    ##                    1.542992

``` r
print(exp(currentModel$coefficients["EmploymentTypePart-time"]))
```

    ## EmploymentTypePart-time 
    ##                1.307001

``` r
print(exp(currentModel$coefficients["MaritalStatusSingle"]))
```

    ## MaritalStatusSingle 
    ##           0.9547409

``` r
print(exp(currentModel$coefficients["MaritalStatusMarried"]))
```

    ## MaritalStatusMarried 
    ##            0.7373604

``` r
print(exp(currentModel$coefficients["HasCoSignerYes"]))
```

    ## HasCoSignerYes 
    ##      0.7271376

``` r
print(exp(currentModel$coefficients["Income100k"]))
```

    ## Income100k 
    ##  0.5148597

The baseline individual in this study is an individual with no loan—they
did not default on their loan. They are 0 yrs old, have a loan amount of
\$0, a credit score of 0, 0 months of employment, 0 credit lines, a 0%
interest rate, full-time employment, a divorced marital status, has no
cosigner, and an annual income of \$0. This is clearly unrealistic, but
it serves as our reference of comparison.

- var1: Age - ~0.964x odds of defaulting, which slightly decreases the
  odds by 3.6% for each 1-yr increase in age

- var2: LoanAmount - 1.000003x odds of defaulting, which minutely
  increases the odds by 0.0003% for each additional dollar (compounded
  increase)

- var3: CreditScore - ~0.999x odds of defaulting, which slightly
  decreases the odds by 0.1% for every 1-pt increase in credit score

- var4: MonthsEmployed - ~0.991x odds of defaulting, which slightly
  decreases the odds by 0.9% for each additional month employed

- var5: NumCreditLines - ~1.155x odds of defaulting, which increases the
  odds by 15.5% for each additional credit line

- var6: InterestRate - ~1.065x odds of defaulting, which increases the
  odds by 6.5% for each 1% increase in interest rate

- var7: EmploymentType (full-time is the baseline category due to
  alphabetical order)

EmploymentTypeUnemployed - ~1.729x odds of defaulting, meaning that the
odds of defaulting for unemployed individuals increase by 72.9% compared
to full-time employed individuals

EmploymentTypeSelf-employed - ~1.543x odds of defaulting, meaning that
the odds of defaulting for self-employed individuals increase by 54.3%
compared to full-time employed individuals

EmploymentTypePart-time - ~1.307x odds of defaulting, meaning that the
odds of defaulting for part-time individuals increase by 30.7% compared
to full-time employed individuals

- var8: MaritalStatus (divorced is the baseline category due to
  alphabetical order)

MaritalStatusSingle - ~0.955x odds of defaulting, meaning that the odds
of defaulting for single individuals decrease by 4.5% compared to
divorced individuals

MaritalStatusMarried - ~0.737x odds of defaulting, meaning that the odds
of defaulting for married individuals decrease by 26.3% compared to
divorced individuals

- var9: HasCoSignerYes (No is the baseline category) - ~0.727x odds of
  defaulting, meaning that the odds of defaulting for individuals with a
  cosigner decrease by 27.3% compared to those without a cosigner

- var10: Income100k - ~0.542x odds of defaulting, which decreases the
  odds by 45.8% for each additional \$100,000 in income

# Conclusion

The variables, NumCreditLines and the categories for EmploymentType
positively impacted the odds of defaulting most significantly. In
addition, MaritalStatusMarried, HasCoSignerYes, and Income100k
negatively impacted the odds of defaulting most significantly. All of
these variables contribute the most to predicting the target, or the
odds of a person defaulting on their loan. These outcomes make logical
sense, although, I did not expect the employment types when compared to
full-time employment to be so high. Moreover, the CoSignerYes variable
negatively impacting the odds makes sense as someone with a secondary
borrower most likely would not want to let the other person down and
default on the loan, letting them take responsibility as well. Usually,
the cosigner is a spouse, family, or a friend, so by defaulting, they
could potentially ruin their relationship with that person. The
MaritalStatusMarried variable has the same logic as the CoSignerYes
variable. The NumCreditLines variable refers to every additional credit
line and intuitively, the more loans someone has to pay off, the more
likely they are unable to pay all of them back.

The fact that LoanTerm and Education are left out is not that
surprising. I would think that someone with a higher education is more
responsible since they dedicated themselves to furthering their
education and getting a higher-paying job, however, that is not always
the case. The pursuance of a higher education does not necessarily
guarantee a better income than those with lower levels of education. I
feel inclined to believe that the more time someone is given to pay off
a loan would decrease the odds of a person defaulting on the loan, but
it may not be statistically significant enough (according to the
dataset) to record this information and utilize it in our model. This is
based off the borrower making regularly scheduled payments too, which is
an important factor (but the variable was not considered so it is does
not hold any means for concern).

In regards to the question of overfitting (found when evaluating the
p-values of the final model), I believe in the context of real-world
financial data and the large sample size of the dataset (3500), using 10
variables is not overfitting and the model is justified.
