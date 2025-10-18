
import React, { useState, useCallback, useEffect } from 'react';
import { PROMPT_OPTIONS_CONFIG } from './constants';
import { PromptOptions, OptionCategory, CopyStatus } from './types';
import { generateSmartRandomizedOptions } from './services/geminiService';

// --- Helper & Icon Components ---
const DiceIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M16 8h.01"></path><path d="M12 12h.01"></path><path d="M8 16h.01"></path>
    <path d="M8 8h.01"></path><path d="M16 16h.01"></path>
  </svg>
);

const CopyIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);


interface DropdownProps {
  label: string;
  options: string[];
  isMulti: boolean;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, isMulti, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isMulti) {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      onChange(selectedOptions.filter(v => v !== ""));
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className="flex flex-col min-w-full sm:min-w-[220px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-xl shadow-md cursor-pointer select-none flex justify-between items-center transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-0.5 mb-2"
      >
        {label}
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
        <select
          multiple={isMulti}
          value={value}
          onChange={handleSelectChange}
          className="text-base p-2 w-full rounded-lg border-2 border-indigo-200 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          size={isMulti ? 8 : undefined}
        >
          <option value="">None</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    </div>
  );
};


// --- Main App Component ---
const App: React.FC = () => {
    const [promptOptions, setPromptOptions] = useState<PromptOptions>({
        characterGroup: '', kawsCharacters: [], cartoonChars: [], themes: [],
        colorway: '', finish: '', poses: [], streetwear: [], scene: '', effects: [], vibe: ''
    });
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

    const handleOptionChange = (category: OptionCategory, value: string | string[]) => {
        setPromptOptions(prev => ({ ...prev, [category]: value }));
    };

    const buildPrompt = useCallback(() => {
        const { characterGroup, kawsCharacters, cartoonChars, themes, colorway, finish, poses, streetwear, scene, effects, vibe } = promptOptions;
        let prompt = `Create a detailed, high-fashion KAWS-style collectible series featuring `;
        if(characterGroup) {
            prompt += `${characterGroup.toLowerCase()}, `;
        } else {
            prompt += `a collectible figure, `;
        }
        if(kawsCharacters.length > 0) prompt += `with KAWS-style characters such as ${kawsCharacters.join(', ')}, `;
        if(cartoonChars.length > 0) prompt += `blended with compatible cartoon characters like ${cartoonChars.join(', ')}, `;
        if(themes.length > 0) prompt += `set in ${themes.join(' or ')} themes, `;
        if(colorway && finish) prompt += `featuring ${colorway} colorway with a ${finish} finish. `;
        else if(colorway) prompt += `featuring a ${colorway} colorway. `;
        else if(finish) prompt += `with a ${finish} finish. `;
        if(poses.length > 0) prompt += `Poses include ${poses.join(', ')}. `;
        if(streetwear.length > 0) prompt += `Styled with ${streetwear.join(', ')}. `;
        if(scene && vibe) prompt += `Set in a ${scene} environment with a ${vibe} mood. `;
        else if(scene) prompt += `Set in a ${scene} environment. `;
        else if(vibe) prompt += `With a ${vibe} mood. `;
        if(effects.length > 0) prompt += `Enhanced with ${effects.join(', ')}. `;
        prompt += `Rendered with ultra-glossy or hyper-matte finishes, highly detailed micro textures, and streetwear-driven fashion from 2025. Set against edgy, cultural, or futuristic urban scenes. No text overlays or copyrighted characters; original mashups only for Etsy compliance.`;
        setGeneratedPrompt(prompt);
    }, [promptOptions]);
    
    useEffect(() => {
        buildPrompt();
    }, [buildPrompt]);

    const handleSmartRandomize = async () => {
        setIsLoading(true);
        try {
            const newOptions = await generateSmartRandomizedOptions();
            setPromptOptions(newOptions);
        } catch (error) {
            console.error(error);
            alert("Could not generate a smart prompt. Please check your API key or try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Set initial prompt on mount
    useEffect(() => {
      handleSmartRandomize();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPrompt).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        }).catch(() => {
            setCopyStatus('failed');
            setTimeout(() => setCopyStatus('idle'), 2000);
        });
    };

    const getCopyButtonClass = () => {
        switch (copyStatus) {
            case 'copied': return 'from-green-500 to-emerald-600';
            case 'failed': return 'from-red-500 to-rose-600';
            default: return 'from-pink-600 to-purple-700';
        }
    };
    
    return (
        <div className="p-4 md:p-8 min-h-screen">
            <header className="text-center mb-10">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-transparent bg-clip-text">
                    ⭐ HOUSE OF STAR ⭐
                </h1>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-700">Family-Inspired & KAWS Edgy Prompt Generator</h2>
                <p className="text-sm text-slate-500 max-w-2xl mx-auto mt-2">Professional AI Art Prompt Generator for Collectible Figure Design</p>
            </header>

            <main>
                <div id="controls" className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-2xl max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* FIX: Use Object.keys with a type assertion for improved type safety, preventing potential downstream errors. */}
                    {(Object.keys(PROMPT_OPTIONS_CONFIG) as OptionCategory[]).map((key) => {
                        const config = PROMPT_OPTIONS_CONFIG[key];
                        return (
                            <Dropdown
                                key={key}
                                label={config.label}
                                options={config.options}
                                isMulti={config.isMulti}
                                value={promptOptions[key]}
                                onChange={(value) => handleOptionChange(key, value)}
                            />
                        );
                    })}
                    <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 flex flex-wrap justify-center items-center gap-4 pt-4">
                        <button 
                            onClick={handleSmartRandomize}
                            disabled={isLoading}
                            className="flex items-center justify-center font-bold bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Generating...
                                </>
                            ) : (
                                <><DiceIcon /> Ultra Smart Randomize</>
                            )}
                        </button>
                        <button
                            onClick={handleCopy}
                            className={`flex items-center justify-center font-bold bg-gradient-to-r text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 ${getCopyButtonClass()}`}
                        >
                            {copyStatus === 'copied' ? <><CheckIcon /> Copied!</> : <><CopyIcon/> Copy Prompt</>}
                        </button>
                    </div>
                </div>

                <div className="mt-8 max-w-5xl mx-auto bg-amber-50/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Generated Prompt:</h3>
                    <p className="text-slate-700 leading-relaxed font-mono text-sm md:text-base">{generatedPrompt}</p>
                </div>

                <div className="mt-8 max-w-5xl mx-auto bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl">
                    <h3 className="text-2xl font-bold text-center mb-6 text-slate-800">🎯 How to Use This Generator</h3>
                     <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-5 rounded-2xl border-l-4 border-indigo-500">
                            <h4 className="font-bold text-lg mb-2 text-slate-800">🎲 Quick Start</h4>
                            <p className="text-sm text-slate-600">Click "Ultra Smart Randomize" for the AI to generate a complete, professionally crafted prompt instantly.</p>
                        </div>
                         <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-5 rounded-2xl border-l-4 border-orange-500">
                            <h4 className="font-bold text-lg mb-2 text-slate-800">🎨 Custom Design</h4>
                            <p className="text-sm text-slate-600">Click any dropdown header to expand and customize elements. Mix and match to create your unique concept.</p>
                        </div>
                         <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-5 rounded-2xl border-l-4 border-emerald-500">
                            <h4 className="font-bold text-lg mb-2 text-slate-800">📋 Export & Use</h4>
                            <p className="text-sm text-slate-600">Copy your prompt and paste it into AI art tools like Midjourney, DALL-E, or Stable Diffusion for amazing results.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
