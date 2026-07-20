<div align="center">
  <h1>⚛️ Future Style Periodic Table</h1>
  <h3>Interactive Future-Style Periodic Table · Immersive Chemistry Education · Bilingual Support</h3>

  <p>
    118 elements, 5% of the universe, blooming at your fingertips.
  </p>

  <p>
    <a href="https://github.com/ruanyf/weekly/blob/master/docs/issue-383.md">
        <img src="https://img.shields.io/badge/Tech%20Enthusiast%20Weekly-Issue%20383%20Featured-ff69b4?style=flat-square&logo=rss" alt="Tech Enthusiast Weekly">
    </a>
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  </p>

  <h3>
    👉 <a href="https://seanwong17.github.io/Future-Style-Periodic-Table/">Click to Enter: Immersive Experience (Live Demo)</a> 👈
  </h3>

</div>

---

## 📖 Introduction

**Future Style Periodic Table** is an interactive periodic table of chemical elements that runs in modern browsers. Unlike traditional static charts, this project adopts a dark cyberpunk style, combining neon effects, glassmorphism, and smooth interactive animations to redefine the visual presentation of chemical elements.

The project covers all **118 chemical elements**, including detailed data such as atomic numbers, relative atomic masses, electron configurations, isotopes, and oxidation states. It supports multi-dimensional heatmap visualization and 3D atomic structure simulation, making it an excellent practice for learning chemistry and exploring front-end technologies.

> **🌟 Highlights:** Click on any element to enter an immersive detail page, drag to rotate the 3D atomic model, and feel the beauty of electron cloud orbits. Supports Chinese/English bilingual switching to meet global user needs.

---

## ✨ Core Features

### 🎨 Immersive Visual Experience
- **Cyberpunk Aesthetics**: Dark background with dynamic grid particles, creating a tech-filled immersive atmosphere.
- **Neon Category Highlights**: 10 major element categories with unique colors, glowing borders on hover.
- **Fully Responsive**: Elegant layouts from 4K desktops to mobile devices (with landscape prompts).
- **Bilingual Support**: One-click toggle between Chinese/English interface to meet different language users' needs.

### 📊 Multi-dimensional Data Visualization
- **Heatmap Mode**: One-click switching of spectral distributions for atomic radius, electronegativity, ionization energy, melting point, and boiling point.
- **Category Filtering**: Click on legends to highlight specific categories (alkali metals, noble gases, lanthanides/actinides, etc.).
- **Real-time Search**: Support for quick location via element symbols, Chinese/English names, or atomic numbers.

### 🔬 3D Atomic Structure Simulation
- **CSS 3D Orbital Model**: Real-time rendering of electron shells and rotating electrons based on electron configuration algorithms.
- **Gesture Interaction**: Support for mouse drag/touch swipe, 360° rotation to observe atomic structure.
- **Expanded View**: Click the icon on the atomic model to enter a standalone full-screen view, supporting **scroll-to-zoom** for detailed electron shell observation.
- **Detailed Data Cards**: Display electron configuration formulas, layered electron counts, isotope stability, common oxidation states, etc.

---

## 📸 Screenshots

**Periodic Table Overview**
![Overview](images/overview.png)

**Heatmap Mode**
![Heatmap](images/heatmap.png)

<table>
  <tr>
    <th width="54%">Element Detail Card</th>
    <th width="46%">3D Atomic Model</th>
  </tr>
  <tr>
    <td valign="top"><img src="images/detail.png" alt="Element Card" width="100%"></td>
    <td valign="top"><img src="images/atom3d.png" alt="3D Atom" width="100%"></td>
  </tr>
</table>

---

## 🛠️ Tech Stack

This project is built with **TypeScript + Vite**, using a modular, type-safe architecture.

| Technology | Purpose |
|:---|:---|
| **TypeScript** | Type-safe application logic, data processing, and interactions |
| **Vite** | Development server, production builds, and hot module replacement |
| **HTML5** | Semantic structure and accessible controls |
| **CSS3** | Grid/Flexbox layout, 3D transforms, CSS variables, and media queries |

### Technical Highlights

- 📐 **CSS Grid**: Precise drawing of irregular periodic table grid layouts.
- 🎭 **CSS 3D Transforms**: `transform-style: preserve-3d` to achieve electron orbital rotation.
- 🎨 **CSS Variables**: Unified theme color management for easy customization.
- 📱 **Responsive Design**: Multi-breakpoint media queries to adapt to various screen sizes.
- 🔒 **Strict TypeScript**: Compile-time checks across application and data types.
- 🧩 **Modular Design**: Table, modal, atom, heatmap, media, and search behavior are separated by responsibility.
- ♿ **Accessible Interaction**: Keyboard controls, focus-managed dialogs, and reduced-motion support.

---

## 📂 Project Structure

The project uses a modular TypeScript structure and requires no backend service.

```text
Future-Style-Periodic-Table/
├── images/                  # README screenshots
├── src/                     # Application source
│   ├── css/
│   │   └── styles.css       # Responsive styles and 3D visuals
│   ├── config/              # Element categories and electron configuration
│   ├── data/                # Structured data for all 118 elements
│   ├── i18n/                # Chinese and English translations
│   ├── modules/             # Table, filters, modal, media, and atom controls
│   ├── state/               # Central application state
│   ├── types/               # Application and element data types
│   └── main.ts              # Application entry point
├── tests/                   # Vitest DOM and regression tests
├── index.html               # Entry file
├── eslint.config.js         # Lint configuration
├── vitest.config.ts         # Test configuration
├── vite.config.ts           # Build configuration
├── package.json             # Scripts and dependencies
├── README.md                # Chinese documentation
├── README_en.md             # English documentation
└── LICENSE                  # MIT License
```

### Code Organization

- **modules/**: Rendering and interaction logic organized by feature.
- **state/**: Current language, visualization mode, category, search query, and modal state.
- **i18n/**: Typed Chinese/English translation dictionaries and helpers.
- **data/**: Detailed data for all 118 elements, including physical properties and isotopes.

---

## 🚀 Quick Start

Node.js 18.18 or newer is required for local development.

```bash
git clone https://github.com/SeanWong17/Future-Style-Periodic-Table.git
cd Future-Style-Periodic-Table
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Quality checks and production build

```bash
npm run check
npm run preview
```

Pushing to `main` runs the quality checks and deploys the generated `dist/` directory to GitHub Pages.

### Quick deployment with Docker

```bash
# Build the production image
docker build -t future-style-periodic-table .

# Run it in the background and expose it on port 8080
docker run -d \
  --name future-style-periodic-table \
  --restart unless-stopped \
  -p 8080:80 \
  future-style-periodic-table
```

Open `http://localhost:8080/` after the container starts. To update the app, rebuild the image and replace the container.

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## ⚠️ Scientific Disclaimer

The **3D atomic models in this project are simplified Bohr model visualizations** for educational demonstration purposes only. They **do not represent actual electron cloud probability distributions**. Real electron behavior follows quantum mechanical principles, with electrons existing as probability clouds in atomic orbitals.

---

## 🤝 Credits

The improvement of this project is inseparable from the support of the community. Special thanks to:

- **Code Contribution**: Thanks to [Melody Young (@keepwow)](https://github.com/keepwow) for providing the English localization and internationalization support.

- **Data Sources**:
  - Primary element data from [Bowserinator/Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON), licensed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
  - Oxidation states and isotope data compiled from public sources

- **Original Inspiration**: [Douyin Video Link](https://www.douyin.com/video/7575067444734622385)
>  - *If you wish to contribute or modify the attribution, please feel free to submit a Pull Request or Issue.*

---

## 📄 License

This project uses the [MIT License](LICENSE) open source license.

- ✅ You can freely use, copy, modify, and distribute this project.
- 📝 Please retain the original author's copyright notice in derivative works.

---

## 📈 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=SeanWong17/Future-Style-Periodic-Table&type=Date)](https://star-history.com/#SeanWong17/Future-Style-Periodic-Table&Date)

---
<div align="center">
  <sub>Designed with ❤️ by Sean Wong</sub>
</div>
