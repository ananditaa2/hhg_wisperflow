import React, { useEffect, useState } from 'react';
import reactRuntime from '../../node_modules/react/umd/react.production.min.js?raw';
import reactDomRuntime from '../../node_modules/react-dom/umd/react-dom.production.min.js?raw';

interface GeneratedCodePreviewProps {
  code: string;
}

const escapeScript = (script: string) => script.replace(/<\/script/gi, '<\\/script');

export const GeneratedCodePreview: React.FC<GeneratedCodePreviewProps> = ({ code }) => {
  const [previewDocument, setPreviewDocument] = useState('');
  const [compileError, setCompileError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const compilePreview = async () => {
      try {
        const Babel = await import('@babel/standalone');
        const compiledCode = Babel.transform(code, {
          filename: 'GeneratedComponent.tsx',
          presets: [
            ['typescript', { allExtensions: true, isTSX: true }],
            ['react', { runtime: 'classic' }]
          ],
          plugins: ['transform-modules-commonjs']
        }).code;

        if (!compiledCode) throw new Error('The code did not produce a runnable component.');

        const embeddedCode = JSON.stringify(compiledCode).replace(/</g, '\\u003c');
        const documentHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      html, body, #root { min-height: 100%; margin: 0; }
      body { font-family: Arial, sans-serif; }
      @keyframes float { from { transform: translateY(-8px); } to { transform: translateY(8px); } }
      #preview-error { margin: 20px; padding: 14px; color: #991b1b; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; font: 14px/1.5 Arial, sans-serif; white-space: pre-wrap; }
      .preview-panel { min-height: 320px; padding: 24px; color: #17202a; font: 14px/1.5 Arial, sans-serif; }
      .preview-panel h2 { margin: 0 0 8px; font-size: 18px; }
      .preview-panel p { color: #667085; }
      .preview-panel pre { overflow: auto; padding: 14px; background: #f1f5f9; border-radius: 6px; }
      .preview-panel textarea { width: 100%; min-height: 72px; padding: 10px; font: 13px/1.5 monospace; border: 1px solid #cbd5e1; border-radius: 6px; }
      .preview-panel button { padding: 8px 12px; color: white; background: #17202a; border: 0; border-radius: 6px; font-weight: 700; cursor: pointer; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>${escapeScript(reactRuntime)}</script>
    <script>${escapeScript(reactDomRuntime)}</script>
    <script type="application/json" id="generated-source">${embeddedCode}</script>
    <script>
      try {
        const generatedModule = { exports: {} };
        const generatedCode = JSON.parse(document.getElementById('generated-source').textContent);
        const generatedRequire = name => {
          if (name === 'react') return window.React;
          if (name === 'react-dom') return window.ReactDOM;
          if (name === 'react-dom/client') return { createRoot: window.ReactDOM.createRoot };
          throw new Error('This preview cannot load the external package "' + name + '".');
        };
        new Function('exports', 'require', 'React', generatedCode)(generatedModule.exports, generatedRequire, window.React);
        const exports = generatedModule.exports;
        const exportNames = Object.keys(exports);
        const componentName = exportNames.find(name => /^[A-Z]/.test(name) && typeof exports[name] === 'function');
        const hookName = exportNames.find(name => /^use[A-Z]/.test(name) && typeof exports[name] === 'function');
        const Component = exports.default || (componentName ? exports[componentName] : null);
        let app;

        if (typeof Component === 'function') {
          app = window.React.createElement(Component, {
            label: 'Preview button',
            children: 'Preview button',
            onClick: () => {}
          });
        } else if (hookName) {
          const HookOutput = function HookOutput() {
            const value = exports[hookName]();
            return window.React.createElement('main', { className: 'preview-panel' },
              window.React.createElement('h2', null, 'Hook output: ' + hookName),
              window.React.createElement('p', null, 'This generated hook ran inside the preview. Resize this preview to update its result.'),
              window.React.createElement('pre', null, JSON.stringify(value, null, 2) ?? String(value))
            );
          };
          app = window.React.createElement(HookOutput);
        } else {
          const functionNames = exportNames.filter(name => typeof exports[name] === 'function');
          if (functionNames.length === 0) throw new Error('This snippet does not export a React component, hook, or runnable function.');

          const panel = document.createElement('main');
          panel.className = 'preview-panel';
          const heading = document.createElement('h2');
          heading.textContent = 'Run an exported function';
          const instructions = document.createElement('p');
          instructions.textContent = 'Enter function arguments as a JSON array, then run the selected function.';
          const select = document.createElement('select');
          functionNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
          });
          const argumentsInput = document.createElement('textarea');
          argumentsInput.setAttribute('aria-label', 'Function arguments as JSON');
          argumentsInput.value = /dedupe|sort/i.test(functionNames[0]) ? '[[3, 1, 3, 2]]' : '[]';
          const runButton = document.createElement('button');
          runButton.textContent = 'Run function';
          const output = document.createElement('pre');
          output.setAttribute('aria-live', 'polite');
          output.textContent = 'Function output will appear here.';
          runButton.onclick = async () => {
            try {
              const args = JSON.parse(argumentsInput.value);
              if (!Array.isArray(args)) throw new Error('Arguments must be a JSON array.');
              const result = await exports[select.value](...args);
              output.textContent = JSON.stringify(result, null, 2) ?? String(result);
            } catch (error) {
              output.textContent = error instanceof Error ? error.message : String(error);
            }
          };
          panel.append(heading, instructions, select, argumentsInput, runButton, output);
          app = panel;
        }

        class PreviewErrorBoundary extends window.React.Component {
          constructor(props) {
            super(props);
            this.state = { error: null };
          }
          static getDerivedStateFromError(error) {
            return { error };
          }
          render() {
            if (this.state.error) {
              return window.React.createElement('pre', { id: 'preview-error' }, String(this.state.error.message || this.state.error));
            }
            return this.props.children;
          }
        }

        const root = document.getElementById('root');
        if (app instanceof HTMLElement) {
          root.replaceChildren(app);
        } else {
          window.ReactDOM.createRoot(root).render(window.React.createElement(PreviewErrorBoundary, null, app));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const output = document.createElement('pre');
        output.id = 'preview-error';
        output.textContent = message;
        document.body.replaceChildren(output);
      }
    </script>
  </body>
</html>`;

        if (cancelled) return;
        setCompileError('');
        setPreviewDocument(documentHtml);
      } catch (error) {
        if (cancelled) return;
        setPreviewDocument('');
        setCompileError(error instanceof Error ? error.message : String(error));
      }
    };

    void compilePreview();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (compileError) {
    return (
      <div role="alert" style={{ minHeight: 320, padding: 20, color: '#991b1b', background: '#fef2f2', borderRadius: 12, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
        {compileError}
      </div>
    );
  }

  return (
    <iframe
      title="Generated React component preview"
      sandbox="allow-scripts"
      srcDoc={previewDocument}
      style={{ width: '100%', height: 520, display: 'block', border: '1px solid #1e293b', borderRadius: 12, background: '#fff' }}
    />
  );
};