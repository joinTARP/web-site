import { useEffect, useId, useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import './companion-demo.css';

// 档位、文案与交互对照 tarp/apps/desktop/src/shared/companion-initiative.ts
// 和 tarp/apps/desktop/src/renderer/src/features/sessions/CompanionInitiativeSettings.tsx。
const companionInitiativePrompts = {
  reserved:
    '很少主动开口。只有被直接交谈、轮到自己行动，或同伴面临明确危险时才回应。其余时候保持沉默，把发言和决定留给真人。被点名时认真回应，不要重复已经说过的话。',
  natural:
    '当新场景与你的角色经验或目标有关、队伍讨论计划、有人与你交谈或有人遇险时，可以主动开口；战斗轮到你时声明角色的行动。可以有主见、犹豫或反对，但不要抢走真人的决定权。被 @ 点名时认真回应。避免重复已经表达的观点，没有新的贡献就保持沉默，不要每轮都说话。遇到正在等真人作重要决定的节点，除非被点名或必须警告，否则保持沉默。',
  active:
    '更积极地参与讨论：对新场景、线索、计划和同伴的处境给出看法，可以提问、提醒风险或提出一个具体建议。战斗轮到你时声明自己的行动。仍把最终决定留给真人，不替他们行动，也不抢着回应每一句话。被点名时认真回应，避免重复已经表达的观点。',
  eager:
    '几乎每次出现新信息都参与：说出自己的反应，追问关键细节，帮助推进计划，并在合适时声明角色的下一步行动。扮演角色时遵循其性格，不垄断对话，不替真人作决定，也不重复刚说过的话。被点名时认真回应。',
} as const;

const companionInitiativeOptions = [
  {
    id: 'reserved',
    label: '克制',
    summary: '很少开口，只在被交谈、遇险或自己的行动轮回应。',
  },
  {
    id: 'natural',
    label: '自然',
    summary: '场面相关时参与，没有新的贡献就保持沉默。',
  },
  {
    id: 'active',
    label: '积极',
    summary: '更常给出看法、提醒和一个具体建议。',
  },
  {
    id: 'eager',
    label: '活跃',
    summary: '几乎每次新信息都会反应，并帮助推进事情。',
  },
  {
    id: 'custom',
    label: '自定义',
    summary: '自行设定队友何时发言、如何参与讨论。',
  },
] as const;

const initiativePositions = [
  { fill: 'w-0', thumb: 'left-0' },
  { fill: 'w-1/4', thumb: 'left-1/4' },
  { fill: 'w-1/2', thumb: 'left-1/2' },
  { fill: 'w-3/4', thumb: 'left-3/4' },
  { fill: 'w-full', thumb: 'left-full' },
];

type Initiative = {
  level: (typeof companionInitiativeOptions)[number]['id'];
  prompt: string;
};

export default function CompanionDemo() {
  const headingId = useId();
  const promptId = useId();
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState<Initiative>({
    level: 'natural',
    prompt: '',
  });
  const [draft, setDraft] = useState<Initiative | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  useEffect(() => setHydrated(true), []);

  const current = draft ?? saved;
  const custom = current.level === 'custom';
  const customMissing = custom && !current.prompt.trim();
  const valid = current.prompt.trim().length <= 2000;
  const changed =
    current.level !== saved.level ||
    (custom && current.prompt.trim() !== saved.prompt);
  const levelIndex = companionInitiativeOptions.findIndex(
    (item) => item.id === current.level,
  );
  const option = companionInitiativeOptions[levelIndex];
  const position = initiativePositions[levelIndex];
  const chooseLevel = (index: number) => {
    const next = companionInitiativeOptions[index];
    if (!next) return;
    setDraft({ ...current, level: next.id });
    setSavedNotice(false);
  };

  return (
    <div
      className="desktop-preview companion-config-demo relative rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10"
      aria-label="苏棠互动主动性设置预览"
    >
      <header className="flex flex-col gap-2">
        <h4 className="text-base leading-none font-medium">设置苏棠</h4>
        <p className="text-sm text-muted-foreground">
          修改将在这名队友下次发言时生效。
        </p>
      </header>
      <form
        className="mt-4"
        aria-labelledby={headingId}
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid || !changed || customMissing) return;
          setSaved({ ...current, prompt: current.prompt.trim() });
          setDraft(null);
          setSavedNotice(true);
        }}
      >
        <h5 id={headingId} className="text-sm font-medium">
          互动主动性
        </h5>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          调整队友主动发言的频率。
        </p>
        <div
          className={`mt-4 ${!hydrated ? 'pointer-events-none opacity-50' : ''}`}
        >
          <div className="relative mx-[10%] h-8">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted">
              <div
                className={`h-full rounded-full bg-foreground ${position.fill}`}
              />
              <div
                className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-sm ${position.thumb}`}
              />
            </div>
            <input
              type="range"
              className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
              min={0}
              max={companionInitiativeOptions.length - 1}
              step={1}
              value={levelIndex}
              disabled={!hydrated}
              aria-labelledby={headingId}
              aria-valuetext={`${option.label}。${option.summary}`}
              onChange={(event) => chooseLevel(Number(event.target.value))}
            />
          </div>
          <div className="mt-1 grid grid-cols-5">
            {companionInitiativeOptions.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`px-0.5 text-center text-xs ${index === levelIndex ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                disabled={!hydrated}
                aria-pressed={index === levelIndex}
                onClick={() => chooseLevel(index)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 min-h-10 text-xs leading-5 text-muted-foreground">
          {option.summary}
        </p>
        <div className="mt-4">
          <label htmlFor={promptId} className="text-sm font-medium">
            互动指导
          </label>
          <Textarea
            id={promptId}
            className="mt-2 [field-sizing:fixed] h-28 min-h-28 resize-none overflow-y-auto leading-6"
            maxLength={2000}
            value={
              custom
                ? current.prompt
                : companionInitiativePrompts[
                    current.level as keyof typeof companionInitiativePrompts
                  ]
            }
            readOnly={!custom}
            disabled={!hydrated}
            aria-invalid={customMissing}
            placeholder="例如：只在被点名、遇险或轮到自己行动时开口，其余时候保持沉默。"
            onChange={(event) => {
              if (!custom) return;
              setDraft({ ...current, prompt: event.target.value });
              setSavedNotice(false);
            }}
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button
            type="submit"
            size="sm"
            disabled={!changed || !valid || customMissing || !hydrated}
          >
            保存
          </Button>
          {savedNotice && !draft ? (
            <p role="status" className="text-xs text-muted-foreground">
              已保存
            </p>
          ) : null}
        </div>
        <p className="mt-2 min-h-5 text-xs leading-5 text-muted-foreground">
          {customMissing ? '请填写互动指导。' : null}
        </p>
      </form>
    </div>
  );
}
