import React, { useState } from 'react';
import './App.css';
import { hello } from './hello';

function App() {
  const [htmlContent, setHtmlContent] = useState('');
  const [tags, setTags] = useState(['h1', 'h2', 'h3']);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [sourceStyle, setSourceStyle] = useState('(1)');
  const [sourcesSelector, setSourcesSelector] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);
  const [isElementPickerActive, setIsElementPickerActive] = useState(false);
  const [sourceElements, setSourceElements] = useState([]);
  const [referenceElements, setReferenceElements] = useState([]);
  const predefinedStyles = ['(1)', '[1]', 'Quelle 1'];

  const handleElementClick = (event) => {
    // Implement the logic for handling element clicks if needed
    console.log('Element clicked:', event.target);
    if (isElementPickerActive) {
      if (!selectedSourceElements.includes(event.target)) {
        event.target.style.backgroundColor = '#d3d3d3';
      } else {
        console.warn('Source element not found for selector');
      }
    }
  };

  const handleElementLeave = (event) => {
    if (isElementPickerActive) {
      if (!selectedSourceElements.includes(event.target)) {
        event.target.style.backgroundColor = '';
      }
    }
  };

  const selectSourceElements = () => {
    let doc;
    try {
      const parser = new DOMParser();
      doc = parser.parseFromString(htmlContent, 'text/html');
      if (doc.querySelector('parsererror')) {
        throw new Error('Invalid HTML structure');
      }
    } catch (error) {
      alert('Error parsing HTML content. Please check the file structure.');
      return;
    }

    const elements = Array.from(doc.querySelectorAll(sourcesSelector));
    setSourceElements(elements.map((el, index) => ({
      element: el,
      id: `source-${index + 1}`
    })));
    alert('Source elements selected.');
  };

  const selectReferenceElements = () => {
    let doc;
    try {
      const parser = new DOMParser();
      doc = parser.parseFromString(htmlContent, 'text/html');
      if (doc.querySelector('parsererror')) {
        throw new Error('Invalid HTML structure');
      }
    } catch (error) {
      alert('Error parsing HTML content. Please check the file structure.');
      return;
    }

    const references = [];
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
    let node = walker.nextNode();
    while (node) {
      const match = node.textContent.match(/\[(\d+)\]/);
      if (match) {
        references.push({
          text: match[0],
          number: parseInt(match[1], 10),
          node
        });
      }
      node = walker.nextNode();
    }
    setReferenceElements(references);
    alert('Reference elements selected.');
  };

  const handleSourceSectionClick = (event) => {
    event.preventDefault();
    setIsElementPickerActive(!isElementPickerActive);
    if (!isElementPickerActive) {
      setSelectedSourceElements([]);
    } else {
      const selector = selectedSourceElements.map(element => {
        const tagName = element.tagName.toLowerCase();
        return `${tagName}${element.id ? `#${element.id}` : ''}${element.className ? `.${element.className.split(' ').join('.')}` : ''}`;
      }).join(', ');
      setSourcesSelector(selector);
      setSelectedSourceElements([]);
    }
  };

  const handleElementPicker = (event) => {
    event.preventDefault();
    if (selectedElement) {
      selectedElement.style.outline = '';
    }
    const element = event.target;
    element.style.outline = '2px solid green';
    setSelectedElement(element);
    alert('Element selected for source section');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => setHtmlContent(e.target.result);
    reader.readAsText(file);
  };

  const generateTableOfContents = () => {
    setPreviousHtmlContent(htmlContent);
    const parser = new DOMParser();
    let doc;
    try {
      doc = parser.parseFromString(htmlContent, 'text/html');
      if (doc.querySelector('parsererror')) {
        throw new Error('Invalid HTML structure');
      }
    } catch (error) {
      alert('Error parsing HTML content. Please check the file structure.');
      return;
    }
    const toc = document.createElement('div');
    toc.setAttribute('id', 'table-of-contents');
    const tocTitle = document.createElement('h2');
    tocTitle.style.marginBottom = '10px';
    tocTitle.textContent = 'Inhaltsverzeichnis';
    toc.appendChild(tocTitle);
    const ol = document.createElement('ol');
    ol.style.paddingLeft = '20px';
    tags.forEach(tag => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach((el, index) => {
        const id = `${tag}-${index}`;
        el.setAttribute('id', id);
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.setAttribute('href', `#${id}`);
        a.textContent = el.textContent;
        li.appendChild(a);
        ol.appendChild(li);
      });
    });
    toc.appendChild(ol);
    if (selectedElement) {
      selectedElement.parentNode.insertBefore(toc, selectedElement);
    } else {
      doc.body.insertBefore(toc, doc.body.firstChild);
    }
    setHtmlContent(doc.documentElement.outerHTML);
  };

  const [previousHtmlContent, setPreviousHtmlContent] = useState('');

  const applyChanges = () => {
    setPreviousHtmlContent(htmlContent);
    let doc;
    try {
      const parser = new DOMParser();
      doc = parser.parseFromString(htmlContent, 'text/html');
      if (doc.querySelector('parsererror')) {
        throw new Error('Invalid HTML structure');
      }
    } catch (error) {
      alert('Error parsing HTML content. Please check the file structure.');
      return;
    }
    const references = doc.querySelectorAll('a[href^="#"]');
    references.forEach((ref, index) => {
      const id = `source-${index}`;
      ref.setAttribute('id', id);
      ref.textContent = sourceStyle.replace('1', index + 1);
    });

    // Highlight changes
    const toc = doc.getElementById('table-of-contents');
    if (toc) {
      toc.style.backgroundColor = '#e0f7fa';
    }
    doc.querySelectorAll('[id]').forEach(el => {
      el.style.backgroundColor = '#e0f7fa';
    });

    setHtmlContent(doc.documentElement.outerHTML);
  };

  const undoChanges = () => {
    setHtmlContent(previousHtmlContent);
  };

  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = "modified.html";
    document.body.appendChild(element);
    element.click();
  };

  const findReferences = () => {
    let doc;
    try {
      const parser = new DOMParser();
      doc = parser.parseFromString(htmlContent, 'text/html');
      if (doc.querySelector('parsererror')) {
        throw new Error('Invalid HTML structure');
      }
    } catch (error) {
      alert('Error parsing HTML content. Please check the file structure.');
      return;
    }

    if (!sourceStyle.includes('1')) {
      alert('Invalid source style. Please include the number "1" in the style to indicate where the number should appear.');
      return;
    }

    const escapedSourceStyle = sourceStyle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const sourcePattern = new RegExp(escapedSourceStyle.replace('1', '(\\d+)'), 'g');
    const references = [];
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
    let node = walker.nextNode();
    while (node) {
      let match;
      while ((match = sourcePattern.exec(node.textContent)) !== null) {
        references.push({ text: match[0], number: parseInt(match[1], 10), node });
      }
      node = walker.nextNode();
    }

    if (references.length === 0) {
      alert('No references found matching the source style.');
    } else {
      setFoundSourceReferences(references);
      console.log('Found References:', references);
    }
  };

  const toggleEditorMode = () => {
    setIsEditorMode(!isEditorMode);
  };

  const linkSources = () => {
    let doc;
    try {
      const parser = new DOMParser();
      doc = parser.parseFromString(htmlContent, 'text/html');
      if (doc.querySelector('parsererror')) {
        throw new Error('Invalid HTML structure');
      }
    } catch (error) {
      alert('Error parsing HTML content. Please check the file structure.');
      return;
    }

    referenceElements.forEach(ref => {
      const source = sourceElements.find(src => src.id === `source-${ref.number}`);
      if (source) {
        const anchor = document.createElement('a');
        anchor.setAttribute('href', `#${source.id}`);
        anchor.textContent = ref.text;
        ref.node.parentElement.replaceChild(anchor, ref.node);
        source.element.setAttribute('id', source.id);
      }
    });

    alert('References have been linked.');
    setHtmlContent(doc.documentElement.outerHTML);
  };

  return (
    <div className="App">
      <h1>HTML Jump Link and Link Target Tool</h1>
      <input type="file" onChange={handleFileUpload} />
      <div className="checkbox-container">
        <label>Select Tags:</label>
        {['h1', 'h2', 'h3'].map(tag => (
          <label key={tag}>
            <input
              type="checkbox"
              value={tag}
              checked={tags.includes(tag)}
              onChange={(e) => {
                const newTags = e.target.checked
                  ? [...tags, tag]
                  : tags.filter(t => t !== tag);
                setTags(newTags);
              }}
            />
            {tag}
          </label>
        ))}
      </div>
      <div>
        <label>Select Tags:</label>
        <select multiple value={tags} onChange={(e) => setTags([...e.target.selectedOptions].map(o => o.value))}>
          <option value="h1">h1</option>
          <option value="h2">h2</option>
          <option value="h3">h3</option>
        </select>
      </div>
      <div>
        <label>Source Style:</label>
        <input type="text" value={sourceStyle} onChange={(e) => setSourceStyle(e.target.value)} />
      </div>
      <div>
        <label>Predefined Styles:</label>
        <select value={sourceStyle} onChange={(e) => setSourceStyle(e.target.value)}>
          {predefinedStyles.map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Sources Section Selector:</label>
        <input type="text" value={sourcesSelector} onChange={(e) => setSourcesSelector(e.target.value)} placeholder="Enter CSS selector for sources section" />
      </div>
      <button onClick={generateTableOfContents}>Inhaltsverzeichnis generieren</button>
      <button
        onClick={handleSourceSectionClick}
        style={{ backgroundColor: isElementPickerActive ? 'green' : '' }}
      >
        {isElementPickerActive ? 'Auswahl bestätigen' : 'Quellenverzeichnis auswählen'}
      </button>
      <button onClick={handleElementPicker}>Elementpicker verwenden</button>
      <button onClick={linkSources}>Quellenverweise verknüpfen</button>
      <button onClick={findReferences}>Quellenverweise finden</button>
      <button onClick={applyChanges}>Änderungen übernehmen</button>
      <button onClick={undoChanges}>Undo</button>
      <button onClick={downloadFile}>Download File</button>
      <button onClick={toggleEditorMode}>
        {isEditorMode ? 'Switch to Preview' : 'Switch to Editor'}
      </button>
      <div
        className={isEditorMode ? 'editor-mode' : 'preview'}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        onMouseOver={handleElementHover}
        onMouseOut={handleElementLeave}
        onClick={handleElementClick}
      />
    </div>
  );
}

export default App;
