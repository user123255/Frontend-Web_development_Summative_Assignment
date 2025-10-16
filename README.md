# Campus Life Planner 🎓

A comprehensive, accessible, and responsive web application built with vanilla HTML/CSS/JavaScript to help university students organize their academic life, track assignments, and manage study time effectively.

![Campus Life Planner](https://img.shields.io/badge/Version-1.0.0-blue)
![Responsive](https://img.shields.io/badge/Responsive-Mobile--First-green)
![Accessibility](https://img.shields.io/badge/Accessibility-WCAG--Compliant-green)
![Vanilla JS](https://img.shields.io/badge/Built--With-Vanilla--JavaScript-yellow)
![ES6 Modules](https://img.shields.io/badge/ES6-Modules-orange)
![Tests](https://img.shields.io/badge/Tests-Comprehensive-brightgreen)

## ✨ Features

### 📊 Dashboard
- **Quick Stats Overview**: See your classes today, upcoming events, and pending tasks at a glance
- **Today's Schedule**: View your daily class schedule with times and locations
- **Recent Activity**: Track your recent actions and completed tasks
- **Quick Actions**: Fast access to add classes, events, and tasks

### 📅 Class Schedule Management
- Add, edit, and delete classes
- Set recurring class schedules (weekly patterns)
- View classes organized by day and time
- Track class locations and instructor information

### 🎉 Campus Events
- Create and manage campus events
- Set event dates, times, and locations
- Add detailed descriptions for events
- View upcoming events in chronological order

### ✅ Task & Assignment Tracking
- Create tasks with due dates and priorities
- Mark tasks as completed or pending
- Filter tasks by status (All, Pending, Completed, Overdue)
- Automatic overdue task detection

### 👤 Profile & Settings
- Personalize your profile information
- Dark mode toggle for comfortable viewing
- Notification preferences
- Settings persistence using local storage

### 📱 Responsive Design
- **Mobile-first approach**: Optimized for smartphones and tablets
- **Progressive enhancement**: Works seamlessly across all screen sizes
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Accessibility**: Keyboard navigation and screen reader friendly

## 🔍 Regex Pattern Catalog

Campus Life Planner uses advanced regex patterns for validation and search. Here's the complete catalog:

### Core Validation Patterns

| Pattern | Regex | Description | Examples |
|---------|-------|-------------|---------|
| **Title Validation** | `/^\S(?:.*\S)?$/` + no double spaces + no duplicate words | Ensures proper spacing and no duplicate consecutive words | ✓ "Math Assignment"<br>❌ " Leading space"<br>❌ "Same Same word" |
| **Duration** | `/^(0|[1-9]\d*)(\.\d{1,2})?$/` | Validates numeric durations (0-24 hours, up to 2 decimals) | ✓ "2.5"<br>✓ "24"<br>❌ "25"<br>❌ "2.555" |
| **Date** | `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` | YYYY-MM-DD format validation | ✓ "2024-12-25"<br>❌ "2024-13-01"<br>❌ "24-12-25" |
| **Category/Tag** | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Letters, spaces, and hyphens only | ✓ "Computer Science"<br>✓ "Web-Development"<br>❌ "Math123" |

### Advanced Search Patterns

| Pattern | Regex | Description | Example Usage |
|---------|-------|-------------|---------------|
| **Duplicate Words** | `/\b(\w+)\s+\1\b/gi` | Detects duplicate consecutive words using back-reference | Finds "the the" in text |
| **Time Tokens** | `/\b([01]?[0-9]|2[0-3]):[0-5][0-9]\b/g` | Finds time references in HH:MM format | Finds "14:30" in "Meeting at 14:30" |
| **Strong Password** | `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/` | Password strength with positive lookahead assertions | Validates "MyPass123!" |
| **Tag Filters** | `/^@(\w+)$/` | Special syntax for filtering by tags | Search "@math" to filter Math records |
| **No Leading Zeros** | `/^(?!0\d)\d+(\.\d{1,2})?$/` | Numbers without leading zeros using negative lookahead | Validates "123" but rejects "0123" 


### Accessibility Features
- **Screen Reader Support**: Full ARIA implementation with live regions
- **Keyboard Navigation**: Complete keyboard-only operation
- **Focus Management**: Visible focus indicators and logical tab order
- **High Contrast**: Automatic support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences

## 🚀 Getting Started

### Prerequisites
- A modern web browser with ES6 module support (Chrome 61+, Firefox 60+, Safari 11+, Edge 16+)
- No server setup required - runs entirely in the browser
- JavaScript must be enabled

### Installation

1. **Clone or Download** this repository to your local machine:
   ```bash
   git clone <repository-url>
   cd campus-life-planner
   ```

2. **Open the application** in your web browser:
   - Double-click on `index.html`, or
   - Open `index.html` in your preferred web browser, or
   - Use a local server like Live Server (VS Code extension) for development

3. **Load sample data** (optional):
   - Go to Settings → Data Management → "Load Sample Data"
   - Or import the provided `seed.json` file

4. **Start organizing** your campus life!

### Project Structure
```
campus-life-planner/
├── index.html          # Main HTML file with semantic structure
├── tests.html          # Comprehensive test suite
├── css/
│   └── styles.css      # Mobile-first responsive CSS (1700+ lines)
├── scripts/            # ES6 modules
│   ├── main.js         # Application entry point
│   ├── storage.js      # localStorage & JSON import/export
│   ├── validators.js   # Regex validation system
│   ├── state.js        # State management & auto-save
│   ├── search.js       # Safe regex search & highlighting  
│   └── ui.js           # Responsive UI components
├── seed.json           # Sample data (15 diverse records)
└── README.md           # This comprehensive documentation
```

## 🧪 Testing

The application includes a comprehensive test suite accessible at `tests.html`:

- **Validation Tests**: All regex patterns and validation rules
- **Search Tests**: Regex search functionality and error handling  
- **Storage Tests**: localStorage operations and JSON validation
- **Integration Tests**: End-to-end functionality testing
- **Accessibility Tests**: ARIA compliance and keyboard navigation

**Run Tests:**
1. Open `tests.html` in your browser
2. Tests run automatically on load
3. View detailed results and regex pattern examples
4. All tests include sample inputs and expected outputs

## 💻 Technology Stack

- **HTML5**: Semantic markup and accessibility features
- **CSS3**: Modern CSS with custom properties, Grid, and Flexbox
- **JavaScript ES6+**: Modern JavaScript with modules and classes
- **Font Awesome**: Beautiful icons
- **Google Fonts**: Inter font family for clean typography
- **Local Storage**: Client-side data persistence

## 🎨 Design Philosophy

### Mobile-First Responsive Design
- Starts with mobile layouts and progressively enhances for larger screens
- Breakpoints: 768px (tablet), 1024px (desktop), 1280px (large desktop)
- Flexible grid system using CSS Grid and Flexbox

### Modern CSS Architecture
- **CSS Custom Properties**: Consistent theming and easy customization
- **Component-based styling**: Modular and maintainable CSS
- **Dark mode support**: Automatic theme switching
- **Accessibility first**: High contrast support and keyboard navigation

### Progressive JavaScript
- **ES6+ features**: Modern syntax with classes, modules, and arrow functions
- **Local storage integration**: Data persists between sessions
- **Event-driven architecture**: Responsive and interactive UI
- **No external dependencies**: Lightweight and fast

## 📚 Usage Guide

### Adding Your First Class
1. Navigate to the **Schedule** section
2. Click the **"Add Class"** button
3. Fill in class details (name, time, location, instructor)
4. Set the weekly schedule pattern
5. Save to see it appear in your dashboard

### Creating Events
1. Go to the **Events** section
2. Click **"Create Event"**
3. Add event details (title, date, time, location, description)
4. Events will appear in your dashboard and events list

### Managing Tasks
1. Visit the **Tasks** section
2. Click **"Add Task"** to create new assignments
3. Set due dates and priorities
4. Use filters to organize tasks by status
5. Mark tasks complete when finished

### Personalizing Your Experience
1. Access the **Profile** section
2. Update your personal information
3. Toggle dark mode in preferences
4. Configure notification settings

## 🎯 Key Features Explained

### Responsive Grid System
The application uses a sophisticated responsive grid that adapts to different screen sizes:

- **Mobile (< 768px)**: Single column layout for optimal touch interaction
- **Tablet (768px - 1024px)**: Two-column grid for better space utilization
- **Desktop (> 1024px)**: Multi-column layout with sidebar and dashboard cards

### Data Persistence
All your data is stored locally in your browser using localStorage:
- Classes, events, and tasks persist between sessions
- Settings and preferences are remembered
- No need for account creation or internet connection

### Dark Mode
Toggle between light and dark themes:
- Reduces eye strain in low-light conditions
- Maintains consistent design language
- Preference is saved automatically

## 🔧 Customization

### Modifying Colors
Edit the CSS custom properties in `css/styles.css`:

```css
:root {
    --primary-color: #3b82f6;     /* Main brand color */
    --accent-color: #10b981;      /* Accent color */
    --bg-primary: #ffffff;        /* Background color */
    /* ... more variables ... */
}
```

### Adding New Features
1. **HTML**: Add new sections to `index.html`
2. **CSS**: Style new components in `css/styles.css`
3. **JavaScript**: Extend functionality in `js/main.js`

### Responsive Breakpoints
Modify breakpoints in the CSS media queries:

```css
/* Tablet */
@media (min-width: 768px) { /* ... */ }

/* Desktop */
@media (min-width: 1024px) { /* ... */ }

/* Large Desktop */
@media (min-width: 1280px) { /* ... */ }
```

## 🛠️ Development

### Code Structure
- **Modular JavaScript**: Organized into logical modules (DataManager, UIComponents, etc.)
- **Separation of Concerns**: HTML for structure, CSS for presentation, JS for behavior
- **Modern Standards**: ES6+ features, semantic HTML, CSS Grid/Flexbox

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance Optimizations
- Minimal external dependencies
- Optimized CSS with efficient selectors
- Debounced UI updates
- Lazy loading of section content

## 📱 Mobile Experience

The Campus Life Planner is designed with mobile users in mind:

- **Touch-friendly interfaces**: Large buttons and touch targets
- **Swipe gestures**: Navigate between sections easily
- **Optimized layouts**: Single-column design for readability
- **Fast loading**: Lightweight codebase for quick startup

## 🔒 Privacy & Data

- **100% Client-side**: No data is sent to external servers
- **Local Storage**: All data stays on your device
- **No Tracking**: No analytics or tracking scripts
- **Offline Capable**: Works without internet connection

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Test across different screen sizes
- Ensure accessibility compliance
- Update documentation for new features

## 📋 Roadmap

### Version 1.1 (Planned)
- [ ] Calendar integration
- [ ] Export/import functionality
- [ ] Notification system
- [ ] Advanced filtering options

### Version 1.2 (Future)
- [ ] Collaborative features
- [ ] Cloud sync capability
- [ ] Mobile app companion
- [ ] Advanced analytics

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? Please create an issue with:

1. **Bug Reports**:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser and device info

2. **Feature Requests**:
   - Clear description of the feature
   - Use case and benefits
   - Implementation suggestions (optional)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Font Awesome** for the beautiful icons
- **Google Fonts** for the Inter typography
- **CSS Grid** and **Flexbox** for modern layout capabilities
- The open-source community for inspiration and best practices

## 📞 Support

Need help? Here are your options:

1. **Documentation**: Check this README and code comments
2. **Issues**: Create a GitHub issue for bugs or questions
3. **Community**: Join discussions in the project repository

---

## 🌟 Quick Start Example

```javascript
// Example: Adding a new class programmatically
DataManager.addClass({
    name: 'Computer Science 101',
    location: 'Tech Building Room 205',
    time: '10:00 AM',
    instructor: 'Dr. Johnson',
    schedule: { 
        tuesday: true, 
        thursday: true 
    }
});
```

**Made with ❤️ for students, by students**

Start organizing your campus life today! Open `index.html` in your browser and begin your journey to better academic organization.

---

*Campus Life Planner v1.0.0 - Responsive Web Application for Student Life Organization*
