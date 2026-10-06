import React, { useEffect, useState } from 'react';
import reactRuntime from '../../node_modules/react/umd/react.production.min.js?raw';
import reactDomRuntime from '../../node_modules/react-dom/umd/react-dom.production.min.js?raw';
import appStyles from '../index.css?raw';

interface GeneratedCodePreviewProps {
  code: string;
}

const escapeScript = (script: string) => script.replace(/<\/script/gi, '<\\/script');
const escapeStyle = (style: string) => style.replace(/<\/style/gi, '<\\/style');

export const GeneratedCodePreview: React.FC<GeneratedCodePreviewProps> = ({ code }) => {
  const [previewDocument, setPreviewDocument] = useState('');
  const [compileError, setCompileError] = useState('');
  const [isCompiling, setIsCompiling] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsCompiling(true);
    setCompileError('');
    setPreviewDocument('');

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
    <style>${escapeStyle(appStyles)}</style>
    <style>
      * { box-sizing: border-box; }
      html, body, #root { min-height: 100%; margin: 0; }
      body { font-family: var(--font-sans, Arial, sans-serif); }
      @keyframes float { from { transform: translateY(-8px); } to { transform: translateY(8px); } }
      #preview-error { margin: 20px; padding: 14px; color: #991b1b; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; font: 14px/1.5 Arial, sans-serif; white-space: pre-wrap; }
      .preview-panel { min-height: 320px; padding: 24px; color: #17202a; font: 14px/1.5 Arial, sans-serif; }
      .preview-controls { padding: 16px; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; }
      .preview-controls h2 { margin: 0 0 6px; font-size: 16px; }
      .preview-controls p { margin: 0 0 10px; color: #667085; }
      .preview-notice { margin: 0 0 10px; padding: 8px 10px; color: #694a00; background: #fff5cc; border-radius: 6px; font-size: 12px; }
      .preview-controls textarea { width: 100%; min-height: 70px; padding: 10px; font: 13px/1.5 monospace; border: 1px solid #cbd5e1; border-radius: 6px; }
      .preview-controls button { margin-top: 8px; padding: 8px 12px; color: white; background: #17202a; border: 0; border-radius: 6px; font-weight: 700; cursor: pointer; }
      .preview-result { min-height: 360px; padding: 20px; }
      .preview-result:empty::after { content: 'Component output will appear here.'; color: #667085; }
      .preview-controls > summary { cursor: pointer; font-weight: 800; }
      .preview-controls > div { padding-top: 12px; }
      .preview-value { margin: 10px 0; padding: 12px; overflow: auto; background: #f1f5f9; border-radius: 6px; white-space: pre-wrap; }
      .preview-error { color: #991b1b; background: #fef2f2; }
      .preview-clicked { margin: 8px 0 0; color: #166534; font-weight: 700; }
      .glow-btn { padding: 12px 20px; color: white; background: #7c3aed; border: 2px solid #18181b; border-radius: 10px; box-shadow: 3px 3px 0 #18181b; cursor: pointer; }
    </style>
  </head>
  <body>
    <div id="root"><main class="preview-panel" role="status">Loading generated output…</main></div>
    <script>
      const showPreviewError = message => {
        const root = document.getElementById('root');
        if (!root) return;
        const output = document.createElement('pre');
        output.id = 'preview-error';
        output.setAttribute('role', 'alert');
        output.textContent = message;
        root.replaceChildren(output);
      };
      window.addEventListener('error', event => {
        showPreviewError(event.message || 'The preview runtime could not start.');
      });
      window.addEventListener('unhandledrejection', event => {
        showPreviewError(event.reason?.message || String(event.reason || 'The preview failed while rendering.'));
      });
      document.addEventListener('securitypolicyviolation', event => {
        showPreviewError('The browser blocked part of the preview: ' + event.violatedDirective);
      });
    </script>
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
            const confetti = window.confetti;
            confetti.default = confetti;
            confetti.confetti = confetti;
            return confetti;
          }
          if (name === 'lucide-react') {
            const glyphs = { Activity: '⌁', AudioLines: '≋', Check: '✓', CheckCircle2: '●', Clock: '◷', Copy: '▢', Mic: '♩', Play: '▶', RotateCcw: '↺', Sparkles: '✦', Zap: 'ϟ' };
            return new Proxy({}, {
              get: (_, iconName) => function PreviewIcon(props) {
                const label = String(iconName);
                return window.React.createElement('span', { ...props, role: 'img', 'aria-label': label, title: label, style: { display: 'inline-grid', placeItems: 'center', minWidth: '1em', textAlign: 'center', ...props?.style } }, glyphs[label] || label.slice(0, 2));
              }
            });
          }
          throw new Error('This preview cannot load the external package "' + name + '".');
        };
        window.confetti = ({ particleCount = 60, spread = 70, origin = {} } = {}) => new Promise(resolve => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            resolve();
            return;
          }
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '9999' });
          document.body.appendChild(canvas);
          const colors = ['#d4ff57', '#ff9278', '#80d9ed', '#c6adff', '#ffd166'];
          const particles = Array.from({ length: Math.min(particleCount, 140) }, () => ({
            x: window.innerWidth * (origin.x ?? 0.5),
            y: window.innerHeight * (origin.y ?? 0.5),
            vx: (Math.random() - 0.5) * spread * 0.16,
            vy: -Math.random() * 8 - 2,
            size: Math.random() * 5 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 70
          }));
          const animate = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
              particle.x += particle.vx;
              particle.y += particle.vy;
              particle.vy += 0.16;
              particle.life -= 1;
              context.globalAlpha = Math.max(0, particle.life / 70);
              context.fillStyle = particle.color;
              context.fillRect(particle.x, particle.y, particle.size, particle.size * 0.65);
            });
            if (particles.some(particle => particle.life > 0)) requestAnimationFrame(animate);
            else {
              canvas.remove();
              resolve();
            }
          };
          animate();
        });
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
            const [componentName, setComponentName] = window.React.useState(componentNames[0]);
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
            const SelectedComponent = exports[componentName] || Component;
            const renderedComponent = window.React.createElement(SelectedComponent, {
              ...props,
              children: props.children ?? 'Preview button',
              onClick: () => setMessage('Component interaction received.')
            });
            const renderedTree = providerName
              ? window.React.createElement(exports[providerName], { value: props.providerValue ?? {} }, renderedComponent)
              : renderedComponent;
            return window.React.createElement('div', null,
              window.React.createElement('section', { className: 'preview-result', 'aria-label': 'Rendered code output' }, renderedTree, message && window.React.createElement('p', { className: 'preview-clicked', role: 'status' }, message)),
              error && window.React.createElement('p', { className: 'preview-error', role: 'alert' }, error),
              window.React.createElement('details', { className: 'preview-controls' },
                window.React.createElement('summary', null, 'Preview options'),
                window.React.createElement('div', null,
                  window.React.createElement('p', null, 'Adjust the sample properties or choose an exported component.'),
                  componentNames.length > 1 && window.React.createElement('select', { 'aria-label': 'Component to preview', value: componentName, onChange: event => setComponentName(event.target.value) }, componentNames.map(name => window.React.createElement('option', { key: name, value: name }, name))),
                  window.React.createElement('p', { className: 'preview-notice' }, 'Isolated preview: React runs locally. Lucide icons use simple glyphs; unsupported packages are blocked.'),
                  window.React.createElement('textarea', { 'aria-label': 'Component props as JSON', value: propsJson, onChange: event => setPropsJson(event.target.value) }),
                  window.React.createElement('button', { type: 'button', onClick: handleUpdate }, 'Apply props')
                )
              )
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
          runButton.type = 'button';
          runButton.textContent = 'Run function';
          const output = document.createElement('pre');
          output.setAttribute('aria-live', 'polite');
          output.textContent = 'Running with the sample arguments…';
          const runFunction = async () => {
            try {
              const args = JSON.parse(argumentsInput.value);
              if (!Array.isArray(args)) throw new Error('Arguments must be a JSON array.');
              const result = await exports[select.value](...args);
              output.textContent = JSON.stringify(result, null, 2) ?? String(result);
            } catch (error) {
              output.textContent = error instanceof Error ? error.message : String(error);
            }
          };
          runButton.onclick = () => void runFunction();
          select.onchange = () => void runFunction();
          void runFunction();
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
        setIsCompiling(false);
      } catch (error) {
        if (cancelled) return;
        setPreviewDocument('');
        setCompileError(error instanceof Error ? error.message : String(error));
        setIsCompiling(false);
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

  if (isCompiling || !previewDocument) {
    return (
      <div role="status" aria-live="polite" style={{ minHeight: 520, display: 'grid', placeItems: 'center', padding: 24, color: '#475569', background: '#fff', border: '1px solid #1e293b', borderRadius: 12, fontWeight: 700 }}>
        Preparing the live code output…
      </div>
    );
  }

  return (
    <iframe
      title="Generated React component preview"
      sandbox="allow-scripts"
      srcDoc={previewDocument}
      style={{ width: '100%', height: 640, display: 'block', border: '1px solid #1e293b', borderRadius: 12, background: '#fff' }}
    />
  );
};
