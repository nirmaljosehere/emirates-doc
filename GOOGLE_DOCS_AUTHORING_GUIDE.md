# Google Docs Authoring Guide for Emirates Document-Based Authoring

This guide explains how to author content in Google Docs for the Emirates website's Teaser and Carousel blocks. Both blocks have been optimized for document-based authoring to provide an intuitive authoring experience.

## Overview

Document-based authoring allows content creators to use familiar Google Docs interfaces to create rich web content. The system automatically converts your document structure into functional web components.

---

## 🎯 Teaser Block

The Teaser block creates visually appealing content sections with images and text in side-by-side layouts.

### Basic Structure

Create a table in Google Docs with the following structure:

```
| teaser |
| image-left |
| [Your Image] |
| # Your Heading |
| Your description text here |
| Learn More → https://example.com |
```

### Configuration Options

#### Layout Direction
Add one of these configuration values in a single cell:

- `image-left` - Image on left, content on right (default)
- `content-left` - Content on left, image on right
- `text-left` - Alternative syntax for content-left
- `photo-left` - Alternative syntax for image-left

#### Traditional Configuration (Alternative)
You can also use key-value pairs:

| Key | Value |
|-----|-------|
| layout | image-left |
| image-alt | Custom alt text |
| cta-text | Custom button text |
| cta-link | https://example.com |

### Content Elements

#### 1. Images
- Add images directly in any cell
- First image found becomes the teaser image
- Images are automatically optimized with lazy loading
- If no alt text is provided, a default is used

#### 2. Headings
- Use any heading level (H1-H6) in Google Docs
- First heading found becomes the main teaser heading
- Automatically converted to H2 for consistency

#### 3. Description Text
- Add paragraphs, lists, or formatted text
- All non-image, non-heading content becomes description
- Supports rich formatting (bold, italic, links)

#### 4. Call-to-Action (CTA)
The system automatically detects CTA links based on text content:

**Auto-detected CTA keywords:**
- "Learn More"
- "Read More" 
- "Discover"
- "Explore"
- "Book Now"
- "View"
- "See More"

**Manual CTA Configuration:**
| cta-text | Learn More |
| cta-link | https://emirates.com/destinations |

### Complete Example

```
| teaser |
| content-left |
| # Discover Dubai |
| Experience the magic of Dubai with Emirates. From stunning skyscrapers to golden beaches, Dubai offers unforgettable experiences for every traveler. |
| Book Your Adventure → https://emirates.com/book |
| [Dubai skyline image] |
```

### Best Practices

1. **Image Quality**: Use high-resolution images (min 1200px wide)
2. **Alt Text**: Provide descriptive alt text for accessibility
3. **Heading Length**: Keep headlines concise (under 60 characters)
4. **Description**: Aim for 2-3 sentences for optimal readability
5. **CTA Text**: Use action-oriented language

---

## 🎠 Carousel Block

The Carousel block creates interactive slideshows with navigation, auto-play, and touch support.

### Basic Structure

Create a table with configuration and slide content:

```
| carousel |
| title: Featured Destinations |
| autoplay: true |
| interval: 5 |
| [Slide 1 Image] |
| # Paris |
| The City of Light awaits |
| [Slide 2 Image] |
| # Tokyo |
| Modern meets traditional |
```

### Configuration Options

#### Single-Cell Configuration (Recommended)
Add configuration in separate cells:

- `autoplay: true/false` - Enable automatic slide progression
- `interval: 5` - Seconds between slides (default: 5)
- `title: Carousel Title` - Optional carousel heading
- `style: hero` - Visual variant (default, cards, hero, testimonials)
- `show-dots: true/false` - Navigation dots (default: true)
- `show-arrows: true/false` - Navigation arrows (default: true)
- `loop: true/false` - Loop back to first slide (default: true)

#### Traditional Configuration (Alternative)
| Key | Value |
|-----|-------|
| title | Featured Destinations |
| autoplay | true |
| interval | 8 |
| variant | hero |
| showDots | true |
| showArrows | true |
| loop | true |

### Slide Content

Each row in your document (after configuration) becomes a slide. Slides support:

#### 1. Image + Text Slides (Most Common)
```
| [Your Image] # Slide Title | Description text here |
```

#### 2. Image-Only Slides
```
| [Your Image Only] |
```

#### 3. Text-Only Slides
```
| # Slide Title | Your slide content here with rich formatting |
```

#### 4. Rich Content Slides
```
| [Image] # Welcome to Emirates | 
Discover world-class service and comfort. 
**Book now** for exclusive offers.
Explore Destinations → https://emirates.com |
```

### Slide Types & Auto-Detection

The system automatically categorizes slides:

- **Media-Text Slide**: Contains both images/video and text
- **Media Slide**: Contains only images or video
- **Text Slide**: Contains only text content

### CTA Detection in Slides

Like teasers, carousels auto-detect CTAs with keywords:
- "Learn More", "Read More", "Discover", "Explore"
- "Book Now", "View", "See More", "Shop Now", "Get Started"

### Complete Example

```
| carousel |
| title: Explore the World with Emirates |
| autoplay: true |
| interval: 6 |
| style: hero |
| [Paris Eiffel Tower image] |
| # Paris, France |
| Experience the romance and elegance of the City of Light. From world-class museums to charming cafés. |
| Discover Paris → https://emirates.com/destinations/paris |
| [Tokyo skyline image] |
| # Tokyo, Japan |
| Where ancient traditions meet cutting-edge innovation in perfect harmony. |
| Explore Tokyo → https://emirates.com/destinations/tokyo |
| [New York image] |
| # New York, USA |
| The city that never sleeps offers endless possibilities and iconic experiences. |
| Book NYC → https://emirates.com/destinations/nyc |
```

### Best Practices

1. **Slide Count**: 3-7 slides work best for user engagement
2. **Content Consistency**: Keep slide content length similar
3. **Image Aspect Ratio**: Use consistent aspect ratios (16:9 recommended)
4. **Auto-play**: Use sparingly - consider accessibility
5. **Text Overlay**: Ensure good contrast between text and background images

---

## 🛠️ Validation & Troubleshooting

### Common Issues

#### Teaser Block
- **No image showing**: Check image placement and format
- **Wrong layout**: Verify layout configuration spelling
- **Missing CTA**: Use recognized keywords or manual configuration
- **Content not appearing**: Ensure substantial text content (10+ characters)

#### Carousel Block
- **No slides detected**: Each slide needs substantial content (30+ characters)
- **Auto-play not working**: Check autoplay configuration and browser settings
- **Images not loading**: Verify image format and size
- **Navigation missing**: Check showDots/showArrows configuration

### Debug Information

Both blocks add helpful data attributes for debugging:

**Teaser:**
- `data-layout`: Current layout direction
- `data-has-image`: Whether image was found
- `data-has-cta`: Whether CTA was detected

**Carousel:**
- `data-slides-count`: Number of slides detected
- `data-autoplay`: Auto-play status
- `data-interval`: Slide interval
- `data-variant`: Visual variant applied

### Browser Console Messages

The blocks provide helpful console warnings:
- Missing images or content
- Configuration issues
- Slide detection problems

---

## 📱 Mobile Optimization

Both blocks are automatically mobile-optimized:

### Teaser
- Stacks vertically on mobile
- Image always appears first
- Content adapts to smaller screens

### Carousel
- Touch/swipe navigation
- Smaller navigation controls
- Responsive slide heights
- Content stacks below images

---

## ♿ Accessibility Features

Both blocks include comprehensive accessibility:

### Teaser
- Proper heading hierarchy
- Alt text for images
- High contrast mode support
- Reduced motion support

### Carousel
- ARIA labels and roles
- Keyboard navigation (arrow keys, Home/End)
- Screen reader announcements
- Auto-play pause on hover/focus
- Respects reduced motion preferences

---

## 🎨 Emirates Brand Guidelines

### Colors
- Primary Red: #d71921
- Hover Red: #c11e24
- Text: #202020
- Secondary Text: #555

### Typography
- Headings: emirates-bold font family
- Body: Roboto font family
- Button text: Bold weight

### Spacing
- Consistent padding and margins
- Mobile-first responsive design
- Emirates-specific shadows and borders

---

## 📚 Examples & Templates

### Simple Teaser
```
| teaser |
| [Hero image] |
| # Fly to Amazing Destinations |
| Experience world-class service |
| Book Now → https://emirates.com/book |
```

### Content-Left Teaser
```
| teaser |
| content-left |
| # Emirates Business Class |
| Luxury redefined at 40,000 feet |
| [Business class cabin image] |
```

### Simple Carousel
```
| carousel |
| [Destination 1] # Dubai | Modern luxury |
| [Destination 2] # London | Historic charm |
| [Destination 3] # Sydney | Coastal beauty |
```

### Advanced Carousel
```
| carousel |
| title: Featured Routes |
| autoplay: false |
| style: cards |
| show-arrows: true |
| [Route image] # Dubai to London | 7 hours of luxury |
| [Route image] # Dubai to Sydney | Your gateway to Australia |
| [Route image] # Dubai to New York | Non-stop to the Big Apple |
```

---

## 🚀 Getting Started

1. **Open Google Docs**
2. **Create a table** for your block
3. **Add block name** in first cell (`teaser` or `carousel`)
4. **Add configuration** (optional)
5. **Add your content** following the patterns above
6. **Publish** your document

The system will automatically detect and render your blocks with the Emirates branding and functionality!

---

*For technical support or additional features, contact the Emirates Digital Team.* 