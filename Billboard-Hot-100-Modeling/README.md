# Billboard Hot 100 Song Rating Modeling

## Project Overview

This project analyzes how artist characteristics and musical attributes are associated with Billboard song ratings and how those relationships have changed across decades. Separate regression models were developed for each decade from the 1960s through the 2010s to investigate whether factors such as genre, artist demographics, tempo, energy, danceability, happiness, loudness, and song length help explain differences in song ratings.

The analysis also considers interaction effects and compares model performance across decades to identify how the characteristics associated with highly rated music have evolved over time.

**Project Context:** Three-person statistical modeling project completed for STAT 423.

## My Contributions

My contributions included:

- Conducting exploratory data analysis to examine relationships between song ratings and both numerical and categorical predictors.
- Creating and interpreting visualizations for variables including artist age, genre, gender, race, energy, danceability, happiness, BPM, loudness, and song length.
- Evaluating the distribution of song ratings to assess the use of linear regression with rating as the response variable.
- Exploring grouped relationships and potential interaction effects between musical characteristics and categorical variables.
- Comparing adjusted R² values and model characteristics across decades through data visualization.
- Contributing to the interpretation and presentation of the final regression results.

## Research Question

How are artist demographics and musical characteristics associated with song ratings, and how have these relationships changed across decades?

## Tools and Methods

- R and R Markdown
- Multiple linear regression
- Interaction terms
- Nested model comparison using ANOVA
- Backward stepwise variable selection
- Adjusted R²
- Exploratory data analysis
- Regression diagnostics
- Data visualization with `ggplot2`
- Pairwise relationship analysis with `GGally`

## Variables

The response variable is:

- `rating`: Overall song rating

Predictors considered in the analysis include:

- `age`: Age of the artist or front person
- `gender`: Artist gender category
- `race`: Artist race category
- `genre`: Song genre
- `bpm`: Beats per minute
- `energy`: Measure of song energy
- `danceability`: Measure of danceability
- `happiness`: Measure of musical positivity
- `loudness_db`: Song loudness in decibels
- `length_sec`: Song duration in seconds
- `year`: Release year used to divide observations by decade

## Data Processing

The original dataset was cleaned and transformed before modeling. Relevant demographic and musical variables were selected, genre categories were consolidated, release years were extracted, and observations containing missing values were removed.

Songs were then divided into decade-level subsets:

- 1960s
- 1970s
- 1980s
- 1990s
- 2000s
- 2010s

This allowed the relationships between song characteristics and ratings to be examined separately across different periods of popular music.

## Exploratory Data Analysis

Individual relationships between the response variable and continuous predictors were visualized using scatterplots with fitted regression lines. Categorical predictors including genre, gender, and race were examined using boxplots.

Because song ratings are discrete, visible banding appears in the scatterplots. However, the overall distribution of ratings was approximately symmetric and unimodal, supporting the treatment of rating as a continuous response for the regression analysis.

Grouped visualizations were also used to investigate whether relationships between predictors and ratings differed across categories, providing motivation for considering interaction effects in the regression models.

## Regression Modeling

Two initial models were considered for each decade.

The first model included the main effects of artist demographics and musical characteristics.

The second model additionally included interaction terms between selected artist characteristics and musical attributes.

Nested model comparisons were used to determine whether the larger interaction model provided sufficient improvement. Backward stepwise selection was then applied to the selected starting model to obtain a reduced model for each decade.

## Model Comparison Across Decades

The adjusted R² values of the final models varied substantially across decades:

| Decade | Adjusted R² |
|---|---:|
| 1960s | 0.245 |
| 1970s | 0.201 |
| 1980s | 0.010 |
| 1990s | 0.215 |
| 2000s | 0.220 |
| 2010s | 0.064 |

The models explained considerably more variation in song ratings during some decades than others. In particular, the 1960s model had the highest adjusted R², while the 1980s model explained very little of the variation in ratings.

## Key Findings

- The characteristics associated with song ratings were not consistent across decades.
- Model explanatory power varied substantially over time, suggesting that the same set of artist and musical characteristics does not explain ratings equally well in every era.
- Genre effects differed across decades, indicating that the relationship between genre and song ratings changed over time.
- Exploratory analysis suggested that relationships between certain musical characteristics and ratings may depend on genre, motivating the inclusion of interaction effects.
- The comparatively low adjusted R² values indicate that a large portion of variation in song ratings is explained by factors not included in the models.

## Limitations

The regression models capture associations rather than causal relationships between song characteristics and ratings.

Song popularity and critical reception may also depend on factors not represented in the dataset, including cultural trends, marketing, artist popularity, historical context, and listener preferences. The differing performance of the decade-level models suggests that these unmeasured factors may vary in importance over time.

The full statistical analysis, visualizations, model output, and R code are included in the project R Markdown file.
