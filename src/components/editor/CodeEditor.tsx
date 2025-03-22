'use client';

import { useState, useCallback, useEffect } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import { analyzeCode, CodeAnalysis } from '@/lib/gemini';
import LoadingSpinner from '../ui/LoadingSpinner';

interface CodeEditorProps {
  defaultLanguage?: string;
  defaultCode?: string;
}

const SUPPORTED_LANGUAGES = ['python', 'javascript', 'cpp'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const CODE_TEMPLATES: Record<SupportedLanguage, string> = {
  python: '# Write your Python code here\n\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()',
  javascript: '// Write your JavaScript code here\n\nfunction main() {\n    console.log("Hello, World!");\n}\n\nmain();',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}'
};

const EDITOR_THEMES = ['vs-dark', 'light', 'hc-black'] as const;
type EditorTheme = typeof EDITOR_THEMES[number];

export default function CodeEditor({
  defaultLanguage = 'python',
  defaultCode = '',
}: CodeEditorProps) {
  const [code, setCode] = useState(defaultCode || CODE_TEMPLATES[defaultLanguage as SupportedLanguage]);
  const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage as SupportedLanguage);
  const [theme, setTheme] = useState<EditorTheme>('vs-dark');
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && code) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(`code_${language}`, code);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [code, language, autoSaveEnabled]);

  // Load saved code on language change
  useEffect(() => {
    const savedCode = localStorage.getItem(`code_${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(CODE_TEMPLATES[language]);
    }
  }, [language]);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    setEditorReady(true);
    
    // Add custom commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleAnalyzeCode();
    });

    // Configure editor settings
    editor.updateOptions({
      tabSize: 4,
      insertSpaces: true,
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,
    });
  }, []);

  const handleBeforeMount: BeforeMount = (monaco) => {
    // Configure language settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as SupportedLanguage);
    setError(null);
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value as EditorTheme);
  };

  const handleAnalyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      setError('Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeCode(code, language);
      setAnalysis(result);
      if (result.suggestions[0]?.startsWith('Error analyzing code:')) {
        setError(result.suggestions[0]);
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while analyzing the code');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={theme}
            onChange={handleThemeChange}
            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm"
          >
            {EDITOR_THEMES.map((t) => (
              <option key={t} value={t}>
                {t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-save</span>
          </label>
        </div>

        <button
          onClick={handleAnalyzeCode}
          disabled={isAnalyzing || !editorReady}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white 
            ${isAnalyzing || !editorReady
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[600px] border rounded-md overflow-hidden">
          {!editorReady && (
            <div className="h-full flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}
          <Editor
            height="100%"
            defaultLanguage={language}
            language={language}
            theme={theme}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            beforeMount={handleBeforeMount}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              suggestOnTriggerCharacters: true,
              snippetSuggestions: 'inline',
              tabCompletion: 'on',
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: true,
              },
              find: {
                addExtraSpaceOnTop: false,
                autoFindInSelection: 'never',
                seedSearchStringFromSelection: 'always'
              },
              parameterHints: {
                enabled: true,
                cycle: true
              }
            }}
          />
        </div>

        <div className="h-[600px] border rounded-md p-4 overflow-y-auto bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Code Analysis</h2>
          {isAnalyzing ? (
            <div className="h-full flex items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : analysis && !error ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Explanation</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{analysis.explanation}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Suggestions</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-600">{suggestion}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Improvements</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index} className="text-gray-600">{improvement}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Security Considerations</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.security.map((item, index) => (
                    <li key={index} className="text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Click "Analyze Code" to get AI-powered suggestions and improvements.</p>
          )}
        </div>
      </div>
    </div>
  );
} 