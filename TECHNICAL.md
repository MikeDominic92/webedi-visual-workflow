# Technical Documentation

## Architecture Overview

WebEDI Visual Workflow follows a modern React architecture with TypeScript for type safety and Zustand for state management.

### Component Architecture

```
App.tsx
├── TicketInput.tsx        # User input handling
│   ├── Sample tickets
│   ├── Text parsing
│   └── Error display
├── SubwayMapVisualizer.tsx # Visualization layer
│   ├── StationNode       # Custom node component
│   ├── SubwayEdge       # Custom edge component
│   └── ReactFlow setup
└── TicketDetails.tsx     # Parsed data display
```

### Data Flow

1. **User Input** → TicketInput component
2. **Parse Request** → workflowStore.parseTicket()
3. **Parsing** → TicketParser.parse()
4. **Workflow Generation** → generateWorkflowFromTicket()
5. **Visualization** → SubwayMapVisualizer
6. **State Updates** → Zustand store

## Parser Implementation

### Parsing Strategy

The parser uses a multi-pattern approach with fallbacks:

```typescript
1. Primary Pattern Match
   ↓ (if fails)
2. Secondary Pattern Match
   ↓ (if fails)
3. Context-Based Detection
   ↓ (if fails)
4. Default/Unknown Value
```

### Key Parser Methods

#### `extractDocumentType()`
- Searches for 3-digit EDI codes (810, 850, 856, etc.)
- Multiple pattern support for flexibility
- Returns null if no match found

#### `extractCompanyNames()`
- **Supplier Detection Priority**:
  1. Title pattern: "5064 Zero Egg Count - Outbound 810"
  2. Email domain: "tdavis@zeroeggcount.com"
  3. Structured fields: "Supplier:", "From:"
  
- **Buyer Detection Priority**:
  1. Rejection pattern: "rejected by Chewy.com"
  2. Known retailer list match
  3. Structured fields: "Buyer:", "Customer:"

#### `extractPONumbers()`
- Handles multiple formats:
  - Traditional: `PO# 12345678`
  - Alphanumeric: `RS41745897`
  - Lists: `RS41745897, RS41732724`
- Validates format and length
- Removes duplicates

#### `detectErrorType()`
- Document-specific error patterns
- Fallback to generic detection
- Error code extraction from parentheses

### Parser Confidence Scoring

```typescript
Confidence = Σ(weights):
- Supplier found: +0.2
- Buyer found: +0.2
- PO numbers found: +0.2
- Known error type: +0.3
- Error code found: +0.1
```

## Workflow Generation

### Node Generation Algorithm

```typescript
const baseFlows = {
  '810': [
    { id: 'start', label: 'Invoice Received', status: 'complete' },
    { id: 'validate', label: 'Validate Invoice', status: 'processing' },
    { id: 'error', label: `Error: ${errorType}`, status: 'error' },
    { id: 'resolution', label: 'Apply Resolution', status: 'processing' },
    { id: 'complete', label: 'Invoice Processed', status: 'start' }
  ]
}
```

### Node Positioning

- X-axis: 250px spacing between nodes
- Y-axis: Alternating 0/50px for visual flow
- Starting position: (200, 200)

### Edge Generation

- Main paths: Default gray color
- Error paths: Red color (#ef4444)
- Animated edges: For processing states

## State Management

### Zustand Store Structure

```typescript
interface WorkflowState {
  // State
  currentTicket: ParsedTicket | null
  workflow: VisualWorkflow | null
  isProcessing: boolean
  error: string | null
  
  // Actions
  parseTicket: (rawText: string) => Promise<void>
  generateWorkflow: (ticket: ParsedTicket) => void
  clearWorkflow: () => void
}
```

### State Update Flow

1. **parseTicket** action:
   - Set `isProcessing: true`
   - Parse text with TicketParser
   - Update `currentTicket`
   - Trigger `generateWorkflow`
   - Handle errors

2. **generateWorkflow** action:
   - Create nodes from ticket data
   - Generate edges between nodes
   - Calculate metadata
   - Update `workflow` state

## Visualization Components

### StationNode Component

Custom React Flow node with:
- Circular design (64x64px)
- Dynamic color based on status
- Pulse animation for processing
- Hover scale effect
- Handle connectors

### SubwayEdge Component

Custom edge renderer with:
- Bezier curve paths
- Configurable stroke width
- Animation support
- Color coding

### React Flow Configuration

```typescript
<ReactFlow
  nodeTypes={{ station: StationNode }}
  edgeTypes={{ main: SubwayEdge, error: SubwayEdge }}
  fitView={true}
  fitViewOptions={{ padding: 0.2 }}
>
```

## Performance Optimizations

### React Optimizations
- `useCallback` for event handlers
- Memoized selectors with Zustand
- Conditional rendering for details

### Parser Optimizations
- Early returns on pattern matches
- Compiled regex patterns
- Minimal string operations

### Rendering Optimizations
- React Flow's virtual scrolling
- CSS transforms for animations
- Tailwind's purged CSS

## TypeScript Configuration

### Compiler Options
- `strict: true` - Maximum type safety
- `target: es5` - Browser compatibility
- `jsx: react-jsx` - New JSX transform
- `downlevelIteration: true` - Iterator support

### Type Safety Benefits
- Compile-time error catching
- IDE autocomplete
- Refactoring confidence
- Self-documenting code

## Error Handling

### Parser Error Handling
- Try-catch wrapper
- Null return on failure
- Console error logging
- User-friendly messages

### UI Error States
- Loading indicators
- Error message display
- Graceful degradation
- Clear recovery actions

## Browser Compatibility

### Supported Browsers
- Chrome 90+ (V8 optimizations)
- Firefox 88+ (WebRender)
- Safari 14+ (Big Sur)
- Edge 90+ (Chromium)

### Polyfills
- None required (CRA handles basics)
- Modern JavaScript features used

## Build Configuration

### Development
```bash
npm start
# Webpack Dev Server
# Hot Module Replacement
# Source Maps
# Error Overlay
```

### Production
```bash
npm run build
# Minification
# Tree Shaking
# Code Splitting
# Asset Optimization
```

## Testing Approach

### Manual Testing Checklist
- [ ] All sample tickets parse correctly
- [ ] Custom tickets with various formats
- [ ] Error states display properly
- [ ] Responsive design on mobile
- [ ] Performance under load

### Future Testing Plans
- Unit tests for parser functions
- Integration tests for workflows
- E2E tests with Playwright
- Performance benchmarks

## Security Considerations

### Input Validation
- Text-only input processing
- No code execution
- XSS prevention via React
- Content Security Policy ready

### Data Handling
- No backend communication
- No data persistence
- Client-side only processing
- No sensitive data storage

## Deployment Considerations

### Static Hosting
- Build outputs to `/build`
- Single-page application
- No server requirements
- CDN-friendly assets

### Environment Variables
- None required currently
- Ready for `.env` configuration
- Public URL configurable

## Maintenance Guidelines

### Adding Document Types
1. Update `DocumentType` union
2. Add error patterns
3. Create workflow template
4. Update documentation

### Modifying Visualizations
1. Update node/edge components
2. Adjust positioning logic
3. Update color schemes
4. Test responsive behavior

### Performance Monitoring
- React DevTools Profiler
- Chrome Performance tab
- Lighthouse audits
- Bundle size tracking