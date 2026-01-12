# ==========================================
# TEMPLATE SPECIFICATION
# ==========================================
template_specification:
  # ==========================================
  # 1. PAGE SETUP & DOCUMENT STRUCTURE
  # ==========================================
  page_setup:
    - "Page size: A4 (11906 x 16838 DXA / 210mm x 297mm)"
    - "Page margins: Top 1440 DXA (1 inch), Bottom 1440 DXA, Left 1080 DXA (0.75 inch), Right 1080 DXA"
    - "Header margin: 708 DXA from edge"
    - "Footer margin: 708 DXA from edge"
    - "Gutter: 0"
    - "Document grid line pitch: 360"
    - "Default line spacing: 259 (auto rule)"

  # ==========================================
  # 2. FONTS
  # ==========================================
  typography:
    primary_font:
      - "Body text font: Arial Narrow (w:ascii and w:hAnsi)"
      - "Complex script fallback: Arial (w:cs)"
      - "Default document font: Calibri (theme minorHAnsi)"
      - "Major heading theme font: Calibri Light (theme majorHAnsi)"
    
    font_sizes:
      - "Candidate name: 28pt (w:sz='56' = 28 half-points x 2)"
      - "Section headers (Highlights, Experience, Education, etc.): 11pt (default, w:sz='22')"
      - "Body text / bullet points: 10pt (w:sz='20')"
      - "Date ranges: 10pt bold (w:sz='20' with w:b)"
      - "Company names: 10pt bold"
      - "Job titles: 10pt regular"

  # ==========================================
  # 3. COLOR SCHEME
  # ==========================================
  colors:
    text_colors:
      - "Candidate name: Orange/Accent2 (#ED7D31, w:themeColor='accent2')"
      - "Section headers: Black (default)"
      - "Body text: Black (default)"
      - "Hyperlinks: Blue (#0563C1, w:themeColor='hyperlink')"
      - "Followed hyperlinks: Purple (#954F72)"
    
    theme_palette:
      - "Dark 1 (dk1): #000000 (black text)"
      - "Light 1 (lt1): #FFFFFF (white background)"
      - "Dark 2 (dk2): #44546A (dark blue-gray)"
      - "Light 2 (lt2): #E7E6E6 (light gray)"
      - "Accent 1: #4472C4 (blue)"
      - "Accent 2: #ED7D31 (orange - used for name)"
      - "Accent 3: #A5A5A5 (gray)"
      - "Accent 4: #FFC000 (gold)"
      - "Accent 5: #5B9BD5 (light blue)"
      - "Accent 6: #70AD47 (green)"

  # ==========================================
  # 4. SECTION STRUCTURE & ORDER
  # ==========================================
  section_structure:
    header_section:
      - "Candidate name at top left (smallCaps formatting)"
      - "Candidate photo: circular crop (ellipse preset geometry), positioned top-right"
      - "Photo dimensions: 1463040 EMU x 1463040 EMU (~1.15 inch diameter)"
      - "Photo position: Right-aligned, anchored to first paragraph"
      - "Horizontal line (bottom border) under name section"
    
    personal_info_section:
      - "Nationality field: Bold label, regular value"
      - "Availability field: Bold label, regular value"
      - "Languages field: Bold label, regular value with proficiency levels (e.g., 'C2', 'B1', 'Native')"
      - "Location field: Bold label, regular value"
      - "Blank line separator after personal info"
    
    main_sections_order:
      - "1. Header (Name + Photo)"
      - "2. Personal Information (Nationality, Availability, Languages, Location)"
      - "3. Highlights (bulleted list)"
      - "4. Experience (chronological entries)"
      - "5. Education"
      - "6. Technical Skills (multi-column layout)"
      - "7. Interests/Hobbies (if present)"
    
    section_header_formatting:
      - "Section titles: Bold, Arial Narrow, 11pt"
      - "Bottom border: Single line, size 4, space 1, auto color"
      - "Multiple tabs after title to extend underline across page"
      - "Text alignment: both (justified)"

  # ==========================================
  # 5. EXPERIENCE ENTRIES FORMAT
  # ==========================================
  experience_format:
    date_company_line:
      - "Format: 'MMM YYYY – MMM YYYY[TAB][TAB]Company Name, Location'"
      - "Date format examples: 'May 2022', 'Sep 2024', 'Oct 2015'"
      - "All elements: Bold, Arial Narrow, 10pt"
      - "Tab stops used for alignment (not spaces)"
    
    job_title_line:
      - "Format: '[TAB][TAB][TAB][TAB][TAB]Job Title'"
      - "Multiple tabs to align with company name above"
      - "Regular weight, Arial Narrow, 10pt"
    
    responsibilities:
      - "Bullet point style: Symbol font bullet (not Unicode)"
      - "List style: ListParagraph with numId reference"
      - "Indentation: left 720 DXA, hanging 360 DXA"
      - "Font: Arial Narrow, 10pt"
      - "Technical keywords: BOLD (w:b and w:bCs tags)"
      - "Text alignment: justified (both)"

  # ==========================================
  # 6. EDUCATION ENTRIES FORMAT
  # ==========================================
  education_format:
    - "Format: 'YYYY – YYYY[TAB][TAB]Degree Title – Institution Name'"
    - "All on one line, Bold, Arial Narrow, 10pt"
    - "Optional second line with specialization (indented with tabs)"
    - "Specialization line: Regular weight, Arial Narrow, 10pt"

  # ==========================================
  # 7. TECHNICAL SKILLS FORMAT
  # ==========================================
  technical_skills_format:
    - "Section uses multi-column layout (continuous section break)"
    - "Skills listed one per line"
    - "Font: Arial Narrow, 10pt"
    - "Text alignment: justified"

  # ==========================================
  # 8. BULLET POINTS & LISTS
  # ==========================================
  bullet_formatting:
    - "Bullet character: Symbol font bullet (w:lvlText empty with Symbol font)"
    - "Level 0 indentation: left 720 DXA, hanging 360 DXA"
    - "Bullet numbering format: bullet (w:numFmt='bullet')"
    - "List paragraph style: 'ListParagraph' (w:pStyle)"
    - "Multi-level support: Up to 9 levels defined"
    - "Second level bullet: 'o' character (Courier New)"

  # ==========================================
  # 9. IMAGES & MEDIA
  # ==========================================
  images:
    candidate_photo:
      - "Shape: Ellipse/Circle crop (a:prstGeom prst='ellipse')"
      - "Size: 1463040 x 1463040 EMU (approximately 115px or 1.15 inch)"
      - "Position: Anchored, floating (wp:anchor)"
      - "Horizontal offset: 4852614 EMU from column"
      - "Vertical offset: 102235 EMU from paragraph"
      - "Text wrapping: None (wp:wrapNone)"
      - "Line style: 63500 width, round cap, no fill"
    
    company_logo:
      - "Location: Header (header2.xml)"
      - "Position: Right-aligned to margin"
      - "Size: 476250 x 666750 EMU (~37.5pt x 52.5pt)"
      - "Vertical offset: -203835 EMU (above paragraph)"
      - "Text wrapping: Top and bottom (wp:wrapTopAndBottom)"
      - "Shape: Rectangle (rect)"

  # ==========================================
  # 10. SPECIAL TEXT FORMATTING
  # ==========================================
  text_emphasis:
    - "Technical keywords in bullets: BOLD"
    - "Candidate name: Small caps (w:smallCaps) + Orange color"
    - "Section headers: Bold only"
    - "Field labels (Nationality, Languages, etc.): Bold"
    - "Dates: Bold"
    - "Company names: Bold"
    - "Job titles: Regular (not bold)"

  # ==========================================
  # 11. HEADER & FOOTER
  # ==========================================
  header_footer:
    header:
      - "Contains company logo (right-aligned)"
      - "Uses 'Header' paragraph style"
      - "Tab stops: center at 4513, right at 9026"
      - "Line spacing: 240 (single)"
    
    footer:
      - "Uses 'Footer' paragraph style"
      - "Tab stops: center at 4513, right at 9026"
      - "Line spacing: 240 (single)"

  # ==========================================
  # 12. PARAGRAPH FORMATTING
  # ==========================================
  paragraph_formatting:
    - "Default paragraph alignment: Both/Justified (w:jc val='both')"
    - "List paragraphs: Contextual spacing enabled"
    - "Standard paragraph indentation: None (0)"
    - "Section header paragraphs: Bottom border with tabs"

  # ==========================================
  # 13. LANGUAGE & LOCALE
  # ==========================================
  locale_settings:
    - "Primary language: en-GB (w:val='en-GB')"
    - "East Asian language: en-US"
    - "Bidirectional language: ar-SA"
    - "Content may use en-CH locale in some sections"

  # ==========================================
  # 14. TABLE STYLES (if applicable)
  # ==========================================
  table_styles:
    - "Table Grid style available with single borders"
    - "Border: single, size 4, auto color"
    - "Default cell margins: top 0, left 108, bottom 0, right 108 DXA"

  # ==========================================
  # 15. PAGE BREAKS & SECTIONS
  # ==========================================
  page_structure:
    - "Page breaks within list items (w:br type='page')"
    - "Continuous section breaks for multi-column layouts"
    - "Section properties define header/footer references per section"
