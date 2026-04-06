# Search API Refactoring Guide - Backend Phase 2, Task 3

## Overview

This refactoring standardizes all search endpoints to use proper HTTP GET with @Query() parameters instead of @Body() (which is invalid for GET requests).

## Changes Made

### Backend Changes ✅

#### 1. **SaleInvoice** (Sale Invoice Controller & Service)

- **Controller**: Added `@Get('search')` endpoint with `@Query('q') searchTerm`
- **Service**: Added `search(searchTerm?)` method with case-insensitive regex on:
  - `invoiceNumber`
  - `accountTitle`
  - `products.code`

#### 2. **PurchaseInvoice** (Purchase Invoice Controller & Service)

- **Controller**: Added `@Get('search')` endpoint with `@Query('q') searchTerm`
- **Service**: Added `search(searchTerm?)` method with case-insensitive regex on:
  - `invoiceNumber`
  - `vendorName`
  - `products.code`

#### 3. **Products** (Products Controller & Service)

- **Controller**: Added `@Get('search')` endpoint with `@Query('q') searchTerm`
- **Service**: Added `search(searchTerm?)` method with case-insensitive regex on:
  - `code`
  - `productName`
  - `category`

#### 4. **DeliveryChallan** (Already Correct ✅)

- Controller uses `@Get('search')` with `@Query('term')`
- Service uses `$regex` with `$options: 'i'` for case-insensitive search

### API Endpoint Summary

#### All search endpoints follow this pattern:

```
GET /[resource]/search?q=searchTerm
```

| Endpoint                   | Method | Query Param  | Returns                         |
| -------------------------- | ------ | ------------ | ------------------------------- |
| `/sale-invoice/search`     | GET    | `?q=term`    | Sale invoices matching term     |
| `/purchase-invoice/search` | GET    | `?q=term`    | Purchase invoices matching term |
| `/products/search`         | GET    | `?q=term`    | Products matching term          |
| `/delivery-chalan/search`  | GET    | `?term=term` | Delivery chalans matching term  |

---

## Frontend Implementation

### Pattern 1: Using axios with params object

```typescript
// ✅ CORRECT - Using query parameters
import api from '../api_configuration/api';

const searchResults = await api.get('/sale-invoice/search', {
  params: {
    q: 'invoice123',
  },
});
```

### Pattern 2: Using URL directly

```typescript
// ✅ CORRECT - Building URL with params
const searchResults = await api.get(`/sale-invoice/search?q=invoice123`);
```

### Pattern 3: Context example

```typescript
// In a React Context for SalesInvoice searching
const performSearch = async (searchTerm: string) => {
  try {
    const response = await api.get('/sale-invoice/search', {
      params: {
        q: searchTerm,
      },
    });
    setSalesInvoices(response.data);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

### Pattern 4: Page/Component example

```typescript
// In a React Page component
const [searchTerm, setSearchTerm] = useState('');
const [searchResults, setSearchResults] = useState([]);

const handleSearch = async (term: string) => {
  try {
    const response = await api.get('/products/search', {
      params: {
        q: term
      }
    });
    setSearchResults(response.data);
  } catch (error) {
    notifications.show({
      title: 'Search Error',
      message: 'Failed to search products',
      color: 'red'
    });
  }
};

return (
  <TextInput
    placeholder="Search products..."
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.currentTarget.value);
      if (e.currentTarget.value.trim()) {
        handleSearch(e.currentTarget.value);
      }
    }}
  />
);
```

---

##Required Frontend Updates

### Files that need updates:

1. **SalesInvoiceContext.tsx** - Add search method
2. **PurchaseInvoiceContext.tsx** - Add search method
3. **ProductsContext.tsx** - Add search method
4. **DeliveryChallanContext.tsx** - Update existing search to match spec
5. Any Pages that call search APIs directly

### Update Template

For each context, add this pattern:

```typescript
// Before: (if using fetch or older pattern)
const response = await api.post('/sale-invoice/search', { q: searchTerm }); // ❌ WRONG

// After: (new pattern)
const response = await api.get('/sale-invoice/search', {
  params: { q: searchTerm },
}); // ✅ CORRECT
```

---

## How Search Works

### Request Flow

```
Frontend sends:
  GET /sale-invoice/search?q=invoice123

↓

Backend receives:
  @Query('q') searchTerm = 'invoice123'

↓

Service executes MongoDB query:
  {
    $or: [
      { invoiceNumber: { $regex: 'invoice123', $options: 'i' } },
      { accountTitle: { $regex: 'invoice123', $options: 'i' } },
      { 'products.code': { $regex: 'invoice123', $options: 'i' } }
    ]
  }

↓

MongoDB returns matching documents

↓

Frontend receives array of matching invoices
```

### Search Logic

**Case-Insensitive Regex:**

```typescript
{ $regex: searchTerm, $options: 'i' }
// $regex: matches pattern
// $options: 'i' = case-insensitive
```

**Multi-field OR search:**

```typescript
$or: [
  { field1: { $regex: term, $options: 'i' } },
  { field2: { $regex: term, $options: 'i' } },
  { field3: { $regex: term ... } }
]
// Returns documents matching ANY field
```

---

## cURL Examples for Testing

### Test SaleInvoice Search

```bash
curl -X GET "http://localhost:3000/sale-invoice/search?q=invoice" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-brand: chemtronics"
```

### Test Product Search

```bash
curl -X GET "http://localhost:3000/products/search?q=widget" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-brand: chemtronics"
```

### Test DeliveryChallan Search

```bash
curl -X GET "http://localhost:3000/delivery-chalan/search?term=cust123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-brand: chemtronics"
```

---

## Validation Checklist

- [ ] All search endpoints use `GET` (not POST)
- [ ] All search endpoints use `@Query()` parameters (not `@Body()`)
- [ ] All services implement `$regex` with `$options: 'i'` for case-insensitivity
- [ ] Frontend calls use `api.get(url, { params: { q: term } })`
- [ ] All search fields are properly indexed in MongoDB for performance
- [ ] Tests pass for empty search terms (should return all documents)
- [ ] Tests pass for partial matches (case-insensitive)
- [ ] Multi-field search returns documents matching ANY field

---

## Performance Considerations

### Index Recommendations

For optimal search performance, add MongoDB indexes:

```typescript
// In your mongoose schema/migration:
saleInvoiceSchema.index({ invoiceNumber: 1 });
saleInvoiceSchema.index({ accountTitle: 1 });
saleInvoiceSchema.index({ 'products.code': 1 });

purchaseInvoiceSchema.index({ invoiceNumber: 1 });
purchaseInvoiceSchema.index({ vendorName: 1 });
purchaseInvoiceSchema.index({ 'products.code': 1 });

productSchema.index({ code: 1 });
productSchema.index({ productName: 1 });
productSchema.index({ category: 1 });
```

### Query Optimization

- Use `select()` to return only needed fields
- Add pagination for large result sets
- Consider debouncing on frontend to avoid excessive requests

---

## Error Handling

### Common Errors

| Error            | Cause               | Solution                                  |
| ---------------- | ------------------- | ----------------------------------------- |
| 400 Bad Request  | Invalid query param | Ensure q parameter is properly encoded    |
| 401 Unauthorized | Missing token       | Check JWT token in localStorage           |
| 500 Server Error | Regex syntax error  | Ensure searchTerm is validated on backend |

### Recommended Frontend Error Handling

```typescript
const handleSearch = async (term: string) => {
  try {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    const response = await api.get('/sale-invoice/search', {
      params: { q: term },
    });

    setResults(response.data || []);
  } catch (error) {
    if (error.response?.status === 401) {
      // Redirect to login
    } else {
      notifications.show({
        title: 'Search Error',
        message: 'Failed to perform search',
        color: 'red',
      });
    }
  }
};
```

---

## DeliveryChallan Note

**DeliveryChallan already uses correct pattern:**

- Controller: `@Get('search')` with `@Query('term')`
- Service: Case-insensitive `$regex` search
- Searches on: `id`, `partyName`, `poNo`

No changes needed for DeliveryChallan.

---

## Summary

- ✅ Backend: All search endpoints now use `GET` + `@Query()` parameters
- ✅ Backend: All search services use case-insensitive `$regex`
- ✅ Backend: Multi-field search implemented
- ⏳ Frontend: API calls need to be updated to use query parameters
- ⏳ Frontend: Contexts need search methods added
- ⏳ Testing: All endpoints should be tested

**Status:** Backend complete, Frontend pending
