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
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:;" />
    <style>
      * { box-sizing: border-box; }
      html, body, #root { min-height: 100%; margin: 0; }
      body { font-family: Arial, sans-serif; }
      @keyframes float { from { transform: translateY(-8px); } to { transform: translateY(8px); } }
      #preview-error { margin: 20px; padding: 14px; color: #991b1b; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; font: 14px/1.5 Arial, sans-serif; white-space: pre-wrap; }
      .preview-panel { min-height: 320px; padding: 24px; color: #17202a; font: 14px/1.5 Arial, sans-serif; }
      .preview-controls { padding: 16px; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; }
      .preview-controls h2 { margin: 0 0 6px; font-size: 16px; }
      .preview-controls p { margin: 0 0 10px; color: #667085; }
      .preview-controls textarea { width: 100%; min-height: 70px; padding: 10px; font: 13px/1.5 monospace; border: 1px solid #cbd5e1; border-radius: 6px; }
      .preview-controls button { margin-top: 8px; padding: 8px 12px; color: white; background: #17202a; border: 0; border-radius: 6px; font-weight: 700; cursor: pointer; }
      .preview-result { min-height: 260px; padding: 24px; }
      .preview-result:empty::after { content: 'Component output will appear here.'; color: #667085; }
      .preview-value { margin: 10px 0; padding: 12px; overflow: auto; background: #f1f5f9; border-radius: 6px; white-space: pre-wrap; }
      .preview-error { color: #991b1b; background: #fef2f2; }
      .preview-clicked { margin: 8px 0 0; color: #166534; font-weight: 700; }
      .glow-btn { padding: 12px 20px; color: white; background: #7c3aed; border: 2px solid #18181b; border-radius: 10px; box-shadow: 3px 3px 0 #18181b; cursor: pointer; }
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
          if (name === 'canvas-confetti') {
            const confetti = () => {};
            confetti.default = confetti;
            confetti.confetti = confetti;
            return confetti;
          }
          if (name === 'lucide-react') {
            return new Proxy({}, {
              get: (_, iconName) => function PreviewIcon(props) {
                return window.React.createElement('span', { ...props, 'aria-label': String(iconName), title: String(iconName), style: { display: 'inline-block', minWidth: '1em', textAlign: 'center', ...props?.style } }, '◆');
              }
            });
          }
          throw new Error('This preview cannot load the external package "' + name + '".');
        };
        window.confetti = () => {};
        new Function('exports', 'require', 'React', generatedCode)(generatedModule.exports, generatedRequire, window.React);
        const exports = generatedModule.exports;
        const exportNames = Object.keys(exports);
        const hookName = exportNames.find(name => /^use[A-Z]/.test(name) && typeof exports[name] === 'function')
          || (typeof exports.default === 'function' && /^use[A-Z]/.test(exports.default.name || '') ? 'default' : null);
        const providerName = exportNames.find(name => /Provider$/.test(name) && typeof exports[name] === 'function')
          || (typeof exports.default === 'function' && /Provider$/.test(exports.default.name || '') ? 'default' : null);
        const componentNames = exportNames.filter(name => /^[A-Z]/.test(name) && !/^use[A-Z]/.test(name) && !/(Provider|Context)$/.test(name) && typeof exports[name] === 'function');
        const hasJSX = /React\.createElement|<[A-Za-z][^>]*>/.test(generatedCode);
        const defaultExport = exports.default;
        const Component = componentNames.length
          ? exports[componentNames[0]]
          : (typeof defaultExport === 'function' && !/^use[A-Z]/.test(defaultExport.name || '') && hasJSX ? defaultExport : null);
        let app;

        if (typeof Component === 'function') {
          const initialProps = {
            label: 'Preview button',
            title: 'A live generated component',
            description: 'Edit the props above to preview this component with different data.',
            text: 'Preview content',
            value: 'Preview value',
            placeholder: 'Type here',
            children: 'Preview button',
            items: ['First item', 'Second item', 'Third item'],
            open: true,
            loading: false,
            disabled: false
          };
          const ComponentPreview = function ComponentPreview() {
            const [props, setProps] = window.React.useState(initialProps);
            const [propsJson, setPropsJson] = window.React.useState(JSON.stringify(initialProps, null, 2));
            const [message, setMessage] = window.React.useState('');
            const [error, setError] = window.React.useState('');
            const handleUpdate = () => {
              try {
                const nextProps = JSON.parse(propsJson);
                if (!nextProps || typeof nextProps !== 'object' || Array.isArray(nextProps)) throw new Error('Props must be a JSON object.');
                setProps(nextProps);
                setError('');
              } catch (cause) {
                setError(cause instanceof Error ? cause.message : String(cause));
              }
            };
            const renderedComponent = window.React.createElement(Component, {
              ...props,
              children: props.children ?? 'Preview button',
              onClick: () => setMessage('Component interaction received.')
            });
            const renderedTree = providerName
              ? window.React.createElement(exports[providerName], null, renderedComponent)
              : renderedComponent;
            return window.React.createElement('div', null,
              window.React.createElement('section', { className: 'preview-controls' },
                window.React.createElement('h2', null, 'Component props'),
                window.React.createElement('p', null, 'Edit the sample properties and apply them to this preview.'),
                window.React.createElement('textarea', { 'aria-label': 'Component props as JSON', value: propsJson, onChange: event => setPropsJson(event.target.value) }),
                window.React.createElement('button', { type: 'button', onClick: handleUpdate }, 'Apply props'),
                error && window.React.createElement('p', { className: 'preview-error', role: 'alert' }, error)
              ),
              window.React.createElement('section', { className: 'preview-result' }, renderedTree, message && window.React.createElement('p', { className: 'preview-clicked', role: 'status' }, message))
            );
          };
          app = window.React.createElement(ComponentPreview);
        } else if (hookName) {
          const HookOutput = function HookOutput() {
            const value = exports[hookName]();
            return window.React.createElement('main', { className: 'preview-panel' },
              window.React.createElement('h2', null, 'Hook output: ' + hookName),
              window.React.createElement('p', null, 'This hook is running in the preview. Resize the browser to update viewport-aware results.'),
              window.React.createElement('pre', null, JSON.stringify(value, null, 2) ?? String(value))
            );
          };
          app = providerName
            ? window.React.createElement(exports[providerName], null, window.React.createElement(HookOutput))
            : window.React.createElement(HookOutput);
        } else if (providerName) {
          app = window.React.createElement(exports[providerName], null,
            window.React.createElement('main', { className: 'preview-panel' },
              window.React.createElement('h2', null, 'Provider ready: ' + providerName),
              window.React.createElement('p', null, 'This snippet exports a context provider, not a screen. Add a consumer component to see provider-backed UI here.')
            )
          );
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
          argumentsInput.value = /dedupe|sort/i.test(functionNames[0])
            ? '[[3, 1, 3, 2]]'
            : /processVoiceIntent/i.test(functionNames[0])
              ? '[{"input":"preview input","options":{}}]'
              : /^(add|sum|multiply|subtract)$/i.test(functionNames[0])
                ? '[2, 3]'
                : '[]';
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