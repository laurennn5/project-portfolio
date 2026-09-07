# Pfizer-BioNTech Vaccine Efficacy Analysis

## Project Overview

This project evaluates the efficacy of the Pfizer-BioNTech BNT162b2 COVID-19 vaccine using both frequentist and Bayesian statistical inference. The analysis compares conclusions obtained through maximum likelihood estimation, confidence intervals, likelihood ratio testing, Bayesian posterior distributions, and multiple prior assumptions.

The project uses clinical trial data consisting of 170 confirmed COVID-19 infections, with 8 cases occurring in the vaccinated group and 162 cases occurring in the placebo group.

**Project Context:** Three-person statistical analysis project completed for STAT 342.

## My Contributions

My contributions included:
- Supporting the frequentist analysis by verifying the mathematical calculations and ensuring the statistical interpretations were accurate.
- Leading the Bayesian inference portion of the project, including the prior and posterior analysis, credible intervals, and comparison of results across different prior assumptions.
- Writing the abstract, introduction, and conclusion of the final report.
- Reviewing the full analysis and written report to ensure the methodology, interpretations, and overall narrative were cohesive and correct.

## Research Question

Does the Pfizer-BioNTech BNT162b2 vaccine demonstrate efficacy greater than the FDA efficacy threshold of 30%, and do frequentist and Bayesian approaches lead to similar conclusions?

## Tools and Methods

- R and R Markdown
- Maximum likelihood estimation (MLE)
- Likelihood functions and log-likelihood optimization
- Large-sample confidence intervals
- Likelihood ratio hypothesis testing
- Empirical bootstrap testing
- Bayesian inference
- Beta prior and posterior distributions
- Bayesian credible intervals
- Sensitivity analysis across multiple prior assumptions
- Data visualization with `ggplot2`

## Dataset

The analysis is based on Pfizer-BioNTech BNT162b2 clinical trial data.

| Group | COVID-19 Cases | No COVID-19 Cases | Total |
|---|---:|---:|---:|
| BNT162b2 Vaccine | 8 | 17,403 | 17,411 |
| Placebo | 162 | 17,349 | 17,511 |
| Total | 170 | 34,752 | 34,922 |

Because the vaccinated and placebo groups were approximately equal in size, the analysis treats the trial randomization as approximately 1:1.

## Statistical Model

The analysis focuses on the 170 participants who developed COVID-19 during the trial.

Let:

- `T` represent the number of COVID-19 cases occurring in the vaccine group
- `π` represent the probability that an infected participant belonged to the vaccine group
- `ψ` represent vaccine efficacy

The observed value is:

```text
T = 8 out of 170 COVID-19 cases
```

The primary hypothesis test is:

```text
H0: Vaccine efficacy = 30%
H1: Vaccine efficacy > 30%
```

## Frequentist Analysis

### Maximum Likelihood Estimation

A likelihood function was derived for vaccine efficacy and maximized to estimate the efficacy parameter.

The maximum likelihood estimate of vaccine efficacy was approximately:

```text
95.06%
```

This suggests an estimated 95% reduction in infection risk for the vaccinated group relative to the placebo group.

### Confidence Interval

The 95% large-sample confidence interval for vaccine efficacy was approximately:

```text
[91.56%, 98.57%]
```

The entire interval lies well above the 30% efficacy threshold.

### Likelihood Ratio Test

A likelihood ratio test was used to compare the estimated efficacy with the null hypothesis value of 30%.

The resulting test statistic was approximately:

```text
W = 121.60
```

The corresponding chi-square p-value was approximately:

```text
2.82 × 10^-28
```

An empirical bootstrap test using 10,000 simulated test statistics also produced a p-value approximately equal to 0.

These results provide extremely strong evidence against the null hypothesis.

## Bayesian Analysis

The Bayesian analysis examined how different prior assumptions influenced the resulting posterior distribution for vaccine efficacy.

The priors ranged from:

- Most pessimistic
- Pessimistic
- Neutral
- Optimistic
- Most optimistic

Across all prior assumptions, the posterior distributions produced similar conclusions and remained centered around high vaccine efficacy.

### Credible Intervals

Equal-tail and bootstrap credible intervals were computed for each prior distribution.

None of the resulting intervals contained efficacy values at or below 30%, providing further evidence that vaccine efficacy exceeded the FDA threshold.

### Bayesian P-Values

The Bayesian p-values across the different prior assumptions were all extremely small:

| Prior | P-Value |
|---|---:|
| Most Pessimistic | 2.42 × 10^-13 |
| Pessimistic | 1.93 × 10^-13 |
| Neutral | 4.67 × 10^-14 |
| Optimistic | 6.64 × 10^-15 |
| Most Optimistic | 9.61 × 10^-15 |

These results indicate that the conclusion remained robust even when substantially different prior beliefs were used.

## Key Findings

- The maximum likelihood estimate of vaccine efficacy was approximately 95%.
- The 95% frequentist confidence interval was approximately 91.56% to 98.57%.
- Both the frequentist and Bayesian analyses provided overwhelming evidence that vaccine efficacy exceeded 30%.
- Bayesian conclusions remained consistent across pessimistic, neutral, and optimistic prior assumptions.
- The observed clinical trial data had a substantially stronger influence on the posterior results than the choice of prior.
- Frequentist and Bayesian approaches ultimately produced similar conclusions about vaccine efficacy.

## Limitations

One limitation of the Bayesian analysis is that prior distributions require assumptions about prior beliefs. These assumptions can introduce subjectivity into the analysis.

Future work could construct priors using efficacy estimates from vaccines targeting similar viral infections rather than relying on subjective optimistic or pessimistic assumptions.

The full statistical analysis, derivations, visualizations, and R code are included in `Final-Paper-Template.Rmd`.
