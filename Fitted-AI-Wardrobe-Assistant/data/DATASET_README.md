# Dataset Documentation: clean.csv

## Overview
The `clean.csv` file contains 28,808 preprocessed fashion items from the Kaggle Fashion Product Images dataset. This document explains the data format, consistency standards, and utility functions.

## Data Format

### CSV Structure
```csv
id,article,season
15970,0,0
39386,1,1
21379,2,0
```

- **Header**: `id,article,season`
- **Total Rows**: 28,808 (+ 1 header = 28,809 lines)
- **Encoding**: UTF-8
- **Delimiter**: Comma (`,`)

## Data Consistency Standards

### Article Codes (0-13)
All article codes are integers from 0 to 13, representing clothing types:

| Code | Article Type | App Category | Description |
|------|-------------|--------------|-------------|
| 0 | Shirt | top | Button-up shirts, dress shirts |
| 1 | Jean | bottom | Denim jeans |
| 2 | Sweatpant | bottom | Sweatpants, joggers |
| 3 | Tee | top | T-shirts, casual tops |
| 4 | Shoe | shoes | All footwear |
| 5 | Other | accessory | Misc accessories |
| 6 | Jacket | outerwear | Light jackets |
| 7 | Short | bottom | Shorts |
| 8 | Dress | top | Dresses (treated as tops) |
| 9 | Rain Jacket | outerwear | Weather-resistant jackets |
| 10 | Skirt | bottom | Skirts |
| 11 | Blazer | outerwear | Formal blazers |
| 12 | Trouser | bottom | Dress pants, trousers |
| 13 | Legging | bottom | Leggings, tights |

### Season Codes (0-3)
All season codes are integers from 0 to 3:

| Code | Season | Description |
|------|--------|-------------|
| 0 | Fall | Autumn clothing |
| 1 | Summer | Warm weather items |
| 2 | Winter | Cold weather items |
| 3 | Spring | Spring clothing |

### ID Values
- Positive integers
- Unique per row
- Range: Varies (e.g., 1855 to 59607)

## Data Validation Rules

All data must conform to:
1. ✅ **Article Code**: 0 ≤ article ≤ 13
2. ✅ **Season Code**: 0 ≤ season ≤ 3
3. ✅ **ID**: Positive integer, non-NaN
4. ✅ **Format**: Exactly 3 comma-separated values per row
5. ✅ **Header**: First row must be `id,article,season`

## Utility Functions

### Loading Data
```typescript
import { loadDataset } from '@/utils/dataset';

const dataset = await loadDataset();
// Returns: DatasetRow[] (28,808 items)
```

### Decoding Codes
```typescript
import { decodeArticle, decodeSeason, articleToCategory } from '@/utils/dataset';

decodeArticle(0);           // "Shirt"
decodeSeason(1);            // "Summer"
articleToCategory(0);       // "top"
```

### Filtering Data
```typescript
import { filterByCategory, filterBySeason } from '@/utils/dataset';

const tops = filterByCategory(dataset, 'top');
const summerItems = filterBySeason(dataset, 'summer');
```

### Statistics
```typescript
import { getDatasetStats } from '@/utils/dataset';

const stats = getDatasetStats(dataset);
console.log(stats.byCategory);  // { top: 12000, bottom: 8000, ... }
console.log(stats.bySeason);    // [{ code: 0, name: "Fall", count: 7000 }, ...]
```

### AI Integration Helpers
```typescript
import { generateVisionAnalysisPrompt, getDatasetContext } from '@/utils/datasetAIHelpers';

// Generate AI prompt with dataset context
const prompt = await generateVisionAnalysisPrompt(userPreferences);

// Get dataset distribution context
const context = await getDatasetContext();
```

## Testing Data Integrity

Run the validation utility in browser console:
```typescript
import { validateDataset } from '@/utils/testDataset';

await validateDataset();
// Outputs comprehensive validation report
```

Expected output:
```
✅ Loaded 28808 items
✅ Item count matches expected: 28808
✅ All rows have valid codes
✅ All 14 article types mapped
✅ All 4 season types mapped
✅ Dataset validation complete!
```

## Integration with App Types

### Mapping to ClothingCategory
The dataset article codes map to our app's 5 categories:

```typescript
type ClothingCategory = 'top' | 'bottom' | 'shoes' | 'accessory' | 'outerwear';
```

**Mapping**:
- `top`: Codes 0, 3, 8 (Shirt, Tee, Dress)
- `bottom`: Codes 1, 2, 7, 10, 12, 13 (Jean, Sweatpant, Short, Skirt, Trouser, Legging)
- `shoes`: Code 4 (Shoe)
- `outerwear`: Codes 6, 9, 11 (Jacket, Rain Jacket, Blazer)
- `accessory`: Code 5 (Other)

### Mapping to AI Season Format
```typescript
type AISeason = 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';

// Dataset uses: 0=Fall, 1=Summer, 2=Winter, 3=Spring
seasonToAIFormat(1); // "summer"
```

## Consistency Guidelines

When working with the dataset:

### ✅ DO:
- Always use the provided decoder functions
- Validate codes before processing
- Handle invalid codes gracefully with fallbacks
- Cache loaded dataset to avoid repeated fetches
- Use typed interfaces (`DatasetRow`, `DecodedDatasetRow`)

### ❌ DON'T:
- Hardcode article/season names (use `ARTICLE_NAMES`, `SEASON_NAMES`)
- Skip validation on external data
- Modify the original clean.csv file
- Assume codes are sequential or complete
- Parse CSV manually (use `parseCSV()`)

## File Locations

```
/clean.csv                           # Raw dataset (28,808 items)
/src/utils/dataset.ts                # Core dataset utilities
/src/utils/datasetAIHelpers.ts       # AI integration helpers
/src/utils/testDataset.ts            # Validation & testing
/src/types/index.ts                  # TypeScript type definitions
/DATASET_README.md                   # This file
```

## Error Handling

All utilities include comprehensive error handling:

```typescript
// Invalid codes default to safe values
decodeArticle(999);        // "Other" + console.warn
decodeSeason(-1);          // "Fall" + console.warn
articleToCategory(999);    // "accessory" + console.warn

// CSV parsing skips malformed rows
const dataset = parseCSV(csvContent);
// Logs warnings for skipped rows, returns valid rows only
```

## Performance Notes

- **Caching**: Dataset is cached after first load (28,808 rows × 3 columns = ~200KB)
- **Parsing**: Synchronous CSV parsing (~50ms for full dataset)
- **Filtering**: O(n) operations, fast for 28K items
- **Memory**: ~500KB total (parsed + cached)

## Future Enhancements

Potential improvements:
- [ ] Binary encoding for smaller file size
- [ ] IndexedDB storage for offline access
- [ ] Lazy loading by category
- [ ] Real-time dataset updates
- [ ] Image URL mappings (if original images become available)

## Questions?

See:
- [src/utils/dataset.ts](./src/utils/dataset.ts) - Source code with detailed comments
- [src/utils/testDataset.ts](./src/utils/testDataset.ts) - Testing and validation examples
