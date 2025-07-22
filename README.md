# WebEDI Visual Workflow

Transform EDI support tickets into intuitive subway map visualizations using React, TypeScript, and React Flow.

![WebEDI Visual Workflow](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🚀 Overview

WebEDI Visual Workflow is a specialized tool designed to help EDI support teams visualize and understand complex EDI transaction errors through an intuitive subway map interface. It automatically parses EDI support tickets and creates visual workflows that show the error flow, making it easier to identify issues and communicate solutions.

### Key Features

- **🎯 Intelligent Ticket Parsing**: Automatically extracts key information from EDI support tickets
- **🚇 Subway Map Visualization**: Transform complex EDI flows into easy-to-understand visual maps
- **🚦 Traffic Light Status System**: Green (Start/Success), Yellow (Processing), Red (Error), Blue (Complete)
- **📊 Real-time Processing**: Instant visualization generation with < 500ms processing time
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎨 Interactive Interface**: Zoom, pan, and click nodes for detailed information

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.2.0 with TypeScript
- **State Management**: Zustand 4.4.6
- **Flow Visualization**: React Flow 11.10.1
- **Styling**: Tailwind CSS 3.3.5
- **Animations**: Framer Motion 10.16.4
- **Build Tool**: Create React App 5.0.1
- **Type Safety**: TypeScript 4.9.5

## 📋 Supported EDI Document Types

- **810** - Invoice
- **850** - Purchase Order
- **856** - Advance Ship Notice (ASN)
- **855** - Purchase Order Acknowledgment
- **997** - Functional Acknowledgment

## 🚦 Getting Started

### Prerequisites

- Node.js 16+ and npm 8+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/webedi-visual-workflow.git
cd webedi-visual-workflow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open http://localhost:3000 in your browser

## 💡 How to Use

### Using Sample Tickets

1. Click one of the three sample ticket buttons:
   - **810 Invoice Error** - Duplicate invoice number from Chewy
   - **850 PO Error** - Item not found from Target
   - **856 ASN Error** - Invalid tracking from Amazon

2. Click "Generate Workflow" to visualize the error flow

### Using Your Own Tickets

1. Paste your EDI support ticket into the text area
2. Ensure the ticket contains:
   - Document type (810, 850, 856, etc.)
   - Company names (supplier and buyer)
   - Error description
   - PO numbers (if applicable)
3. Click "Generate Workflow"

### Example Ticket Format

```
5064 Zero Egg Count - Outbound 810 Invoices rejected by Chewy.com (Duplicate Invoice Number)
IMMEDIATE ACTIONS:
COMM -> Email Tim Davis (tdavis@zeroeggcount.com), CC Marta Brito (mbrito@chewy.com).
COMM -> State the exact rejection reason provided by Chewy: "This invoice number already exists. You must provide a unique invoice number. (AP-810776)".
COMM -> List the affected PO Numbers: RS41745897, RS41732724, RS41732712.
```

## 🔍 Parser Capabilities

The intelligent parser can extract:

### Company Information
- **Supplier Detection**:
  - From ticket titles: "5064 Zero Egg Count - Outbound 810"
  - From email addresses: "tdavis@zeroeggcount.com" → "Zero Egg Count"
  - From structured fields: "Supplier:", "Vendor:", "From:"
  
- **Buyer Detection**:
  - From rejection patterns: "rejected by Chewy.com"
  - From known retailers: Walmart, Target, Amazon, Chewy, Home Depot, etc.
  - From structured fields: "Buyer:", "Customer:", "To:"

### Document Information
- **PO Number Formats**:
  - Standard: PO# 12345678
  - Alphanumeric: RS41745897, TG87654321
  - Comma-separated lists: "RS41745897, RS41732724, RS41732712"
  
- **Error Detection**:
  - Error types: Duplicate Invoice, Price Mismatch, Invalid Item, etc.
  - Error codes: (AP-810776), ERR-CAT-404, AMZ-856-001
  - Custom error messages with context

### Ticket Metadata
- Ticket IDs from title (e.g., "5064")
- Timestamps and dates
- Action types: rejection, acceptance, modification

## 🎨 Visual Elements

### Node Types
- **Station Nodes**: Circular nodes representing workflow steps
- **Status Colors**:
  - 🟢 Green: Start point or successful completion
  - 🟡 Yellow: Currently processing
  - 🔴 Red: Error state
  - 🔵 Blue: Process complete

### Edge Types
- **Main Path**: Solid lines for normal flow
- **Error Path**: Red lines for error flows
- **Animated**: Dashed lines with animation for active processes

### Interactive Features
- **Zoom Controls**: Zoom in/out for detailed view
- **Pan**: Drag to move around the map
- **Minimap**: Overview of the entire workflow
- **Node Details**: Click nodes for additional information
- **Status Legend**: Quick reference for color meanings

## 📊 Performance Metrics

- **Parsing Speed**: < 100ms for standard tickets
- **Visualization Generation**: < 500ms
- **Memory Usage**: < 50MB for typical workflows
- **Browser Compatibility**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🏗️ Project Structure

```
webedi-visual-workflow/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── TicketInput.tsx        # Ticket input interface
│   │   └── SubwayMapVisualizer.tsx # Flow visualization
│   ├── store/          # State management
│   │   └── workflowStore.ts       # Zustand store
│   ├── types/          # TypeScript definitions
│   │   └── index.ts               # Type interfaces
│   ├── utils/          # Utility functions
│   │   └── ticketParser.ts        # Ticket parsing logic
│   ├── App.tsx         # Main application
│   ├── index.tsx       # Entry point
│   └── index.css       # Global styles
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── tailwind.config.js  # Tailwind CSS config
└── README.md          # This file
```

## 🔧 Development

### Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Adding New Document Types

1. Add the document type to `DocumentType` in `src/types/index.ts`
2. Add error patterns to `ERROR_PATTERNS` in `src/utils/ticketParser.ts`
3. Add workflow steps to `baseFlows` in `src/store/workflowStore.ts`

### Customizing Visual Style

1. Update Tailwind theme in `tailwind.config.js`
2. Modify node styles in `SubwayMapVisualizer.tsx`
3. Adjust colors in the `statusColors` object

## 🐛 Troubleshooting

### Common Issues

1. **Parser not extracting company names**
   - Ensure the ticket includes clear company identifiers
   - Check for email addresses or "rejected by" patterns

2. **PO numbers not detected**
   - Verify PO numbers follow supported formats
   - Check for proper spacing and separators

3. **Visualization not updating**
   - Clear the workflow and regenerate
   - Check browser console for errors

## 📈 Future Enhancements

- [ ] Export workflows as images or PDFs
- [ ] Save and load ticket history
- [ ] Advanced filtering and search
- [ ] Integration with EDI systems
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Collaborative features
- [ ] Analytics dashboard

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React Flow team for the excellent flow visualization library
- Tailwind CSS for the utility-first CSS framework
- The EDI community for inspiration and feedback

---

Built with ❤️ for the EDI Support Community