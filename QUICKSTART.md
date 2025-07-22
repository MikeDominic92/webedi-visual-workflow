# Quick Start Guide

Get up and running with WebEDI Visual Workflow in 5 minutes!

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/webedi-visual-workflow.git

# Navigate to project directory
cd webedi-visual-workflow

# Install dependencies
npm install

# Start the development server
npm start
```

## 🎯 Your First Visualization

### Option 1: Use a Sample Ticket

1. Open http://localhost:3000
2. Click the **"810 Invoice Error"** button
3. Click **"Generate Workflow"**
4. See your first subway map visualization!

### Option 2: Use Your Own Ticket

1. Copy this example ticket:
```
5064 Zero Egg Count - Outbound 810 Invoices rejected by Chewy.com (Duplicate Invoice Number)
COMM -> List the affected PO Numbers: RS41745897, RS41732724, RS41732712.
Error: This invoice number already exists. (AP-810776)
```

2. Paste it into the text area
3. Click **"Generate Workflow"**

## 🎨 Understanding the Visualization

### Node Colors
- 🟢 **Green**: Starting point or success
- 🟡 **Yellow**: Currently processing (watch it pulse!)
- 🔴 **Red**: Error occurred here
- 🔵 **Blue**: Process completed

### What You'll See
1. **Invoice Received** (Green) - Starting point
2. **Validate Invoice** (Yellow) - Processing step
3. **Error: DUPLICATE_INVOICE** (Red) - The problem
4. **Apply Resolution** (Yellow) - Fix in progress
5. **Invoice Processed** (Blue) - Goal state

## 🔍 Extracted Information

The parser will show:
- **Document Type**: 810 (Invoice)
- **Supplier**: Zero Egg Count
- **Buyer**: Chewy
- **Error**: DUPLICATE_INVOICE
- **Error Code**: AP-810776
- **PO Numbers**: RS41745897, RS41732724, RS41732712
- **Confidence**: 100%

## 💡 Tips

1. **Zoom**: Use mouse wheel or controls to zoom in/out
2. **Pan**: Click and drag to move around
3. **Details**: Click on any node for more information (check console)
4. **Clear**: Use the Clear button to start fresh

## 🚦 Common Ticket Formats

### Invoice Error (810)
```
[Ticket#] [Supplier] - Outbound 810 Invoices rejected by [Buyer] ([Error])
Affected PO Numbers: [PO1], [PO2], [PO3]
```

### Purchase Order Error (850)
```
[Ticket#] [Supplier] - 850 Purchase Order rejected by [Buyer]
Error: [Description] ([Code])
Affected PO Numbers: [PO1], [PO2]
```

### Shipment Error (856)
```
[Ticket#] [Supplier] - 856 ASN Rejected by [Buyer] ([Error])
Error Code: ([Code])
Affected PO Numbers: [PO1], [PO2], [PO3]
```

## 🎉 Next Steps

1. Try all three sample tickets
2. Paste your own EDI tickets
3. Explore the interactive features
4. Check the full README for advanced usage

Happy visualizing! 🚇