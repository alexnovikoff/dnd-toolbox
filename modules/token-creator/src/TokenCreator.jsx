// TokenCreator.jsx — React port of the Foundry Token Creator, adopted into the
// hub. Frame graphics come verbatim from ./frames.js; all UI chrome uses the
// design system (CSS tokens + components). The <canvas> needs raw color strings,
// so it reads the resolved palette from useTheme().palette.
import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon, Slider, Field, Button, useTheme, SANS } from '@dnd/design-system';
import { frameDefs } from './frames.js';

const S = 512;

function FrameThumb({ frame, size }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current?.getContext('2d');
    if (!c) return; // no canvas (e.g. jsdom) — skip drawing
    c.clearRect(0, 0, size, size);
    if (frame.fn) frame.fn(c, size);
    else if (frame.img) {
      c.save();
      c.beginPath();
      c.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      c.clip();
      c.drawImage(frame.img, 0, 0, size, size);
      c.restore();
    }
  }, [frame, size]);
  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size, display: 'block' }} />;
}

function Lbl({ children }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: 'var(--ds-faint)',
        fontWeight: 700,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

export default function TokenCreator() {
  const { palette } = useTheme();
  const canvasRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ on: false, x: 0, y: 0 });
  const renderRef = useRef(() => {});

  const [charImg, setCharImg] = useState(null);
  const [scale, setScale] = useState(100);
  const [activeFrame, setActiveFrame] = useState(0);
  const [pendingFrame, setPendingFrame] = useState(null);
  const [customFrames, setCustomFrames] = useState([]);
  const [exportSize, setExportSize] = useState(512);
  const [fileName, setFileName] = useState('');
  const [addName, setAddName] = useState('');
  const [editIdx, setEditIdx] = useState(-1);
  const [editName, setEditName] = useState('');

  const allFrames = frameDefs.concat(customFrames);
  const getFrame = (i) => (i < frameDefs.length ? frameDefs[i] : customFrames[i - frameDefs.length]);
  const applyFrame = (c, s, i) => {
    const f = getFrame(i);
    if (!f) return;
    if (f.fn) f.fn(c, s);
    else c.drawImage(f.img, 0, 0, s, s);
  };

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, S, S);
    ctx.save();
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
    ctx.clip();
    if (charImg) {
      const sc = scale / 100,
        w = charImg.naturalWidth * sc,
        h = charImg.naturalHeight * sc;
      ctx.drawImage(charImg, S / 2 - w / 2 + posRef.current.x, S / 2 - h / 2 + posRef.current.y, w, h);
    } else {
      ctx.fillStyle = palette.raised;
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = palette.faint;
      ctx.font = '500 22px "Public Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Загрузите портрет', S / 2, S / 2);
    }
    ctx.restore();
    if (pendingFrame) ctx.drawImage(pendingFrame, 0, 0, S, S);
    else applyFrame(ctx, S, activeFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charImg, scale, activeFrame, pendingFrame, customFrames, palette.raised, palette.faint]);

  renderRef.current = render;
  useEffect(() => {
    render();
  }, [render]);

  // drag + wheel on canvas
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const down = (e) => {
      dragRef.current = { on: true, x: e.clientX, y: e.clientY };
      e.preventDefault();
    };
    const move = (e) => {
      if (!dragRef.current.on) return;
      const rect = cv.getBoundingClientRect(),
        k = S / rect.width;
      posRef.current.x += (e.clientX - dragRef.current.x) * k;
      posRef.current.y += (e.clientY - dragRef.current.y) * k;
      dragRef.current.x = e.clientX;
      dragRef.current.y = e.clientY;
      renderRef.current();
    };
    const up = () => {
      dragRef.current.on = false;
    };
    const wheel = (e) => {
      e.preventDefault();
      setScale((prev) => Math.max(10, Math.min(400, prev + (e.deltaY > 0 ? -5 : 5))));
    };
    cv.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    cv.addEventListener('wheel', wheel, { passive: false });
    return () => {
      cv.removeEventListener('mousedown', down);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      cv.removeEventListener('wheel', wheel);
    };
  }, []);

  const loadFile = (file, isFrame) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const im = new Image();
      im.onload = () => {
        if (isFrame) {
          setPendingFrame(im);
          setAddName('');
        } else {
          posRef.current = { x: 0, y: 0 };
          const fit = Math.min(S / im.naturalWidth, S / im.naturalHeight) * 0.9;
          setCharImg(im);
          setScale(Math.round(fit * 100));
        }
      };
      im.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const pickFile = (isFrame) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = isFrame ? 'image/png' : 'image/*';
    inp.onchange = () => loadFile(inp.files[0], isFrame);
    inp.click();
  };

  const doExport = () => {
    const exp = document.createElement('canvas');
    exp.width = exp.height = exportSize;
    const ectx = exp.getContext('2d'),
      ratio = exportSize / S;
    ectx.save();
    ectx.beginPath();
    ectx.arc(exportSize / 2, exportSize / 2, exportSize / 2, 0, Math.PI * 2);
    ectx.clip();
    if (charImg) {
      const sc = scale / 100,
        w = charImg.naturalWidth * sc * ratio,
        h = charImg.naturalHeight * sc * ratio;
      ectx.drawImage(
        charImg,
        exportSize / 2 - w / 2 + posRef.current.x * ratio,
        exportSize / 2 - h / 2 + posRef.current.y * ratio,
        w,
        h
      );
    }
    ectx.restore();
    applyFrame(ectx, exportSize, activeFrame);
    exp.toBlob((blob) => {
      const url = URL.createObjectURL(blob),
        a = document.createElement('a');
      a.href = url;
      a.download = (fileName.trim() || 'token') + '.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    }, 'image/png');
  };

  const addToCollection = () => {
    if (!pendingFrame) return;
    const n = addName.trim() || 'Custom ' + (customFrames.length + 1);
    const next = customFrames.concat([{ name: n, img: pendingFrame }]);
    setCustomFrames(next);
    setActiveFrame(frameDefs.length + next.length - 1);
    setPendingFrame(null);
    setAddName('');
  };

  const dropStyle = {
    border: '1.5px dashed var(--ds-line)',
    borderRadius: 10,
    padding: '16px 10px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: 12,
    color: 'var(--ds-muted)',
    lineHeight: 1.5,
    background: palette.raised + '70',
    '--acc': 'var(--ds-accent)',
  };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: 'var(--ds-bg)' }}>
      {/* controls */}
      <div
        style={{
          width: 308,
          flex: '0 0 308px',
          borderRight: '1px solid var(--ds-line2)',
          background: 'var(--ds-panel)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflow: 'auto',
        }}
      >
        <div>
          <Lbl>Портрет персонажа</Lbl>
          <div
            className="tc-drop"
            style={dropStyle}
            onClick={() => pickFile(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              loadFile(e.dataTransfer.files[0], false);
            }}
          >
            {charImg
              ? 'Изображение загружено · клик, чтобы заменить'
              : 'Перетащите изображение сюда или нажмите для загрузки'}
          </div>
        </div>

        <Slider label="Масштаб" value={scale} min={10} max={400} suffix="%" onChange={setScale} />

        <div>
          <Lbl>Рамка</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {allFrames.map((f, idx) => {
              const isCustom = idx >= frameDefs.length;
              const on = idx === activeFrame && !pendingFrame;
              return (
                <div
                  key={idx}
                  className="tc-thumb"
                  onClick={() => {
                    setActiveFrame(idx);
                    setPendingFrame(null);
                  }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: 6,
                    borderRadius: 9,
                    cursor: 'pointer',
                    background: 'var(--ds-raised)',
                    border: `1.5px solid ${on ? 'var(--ds-accent)' : 'transparent'}`,
                  }}
                >
                  <FrameThumb frame={f} size={58} />
                  {editIdx === idx ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const ci = idx - frameDefs.length;
                          const cf = customFrames.slice();
                          cf[ci] = { ...cf[ci], name: editName.trim() || cf[ci].name };
                          setCustomFrames(cf);
                          setEditIdx(-1);
                        }
                        if (e.key === 'Escape') setEditIdx(-1);
                      }}
                      onBlur={() => setEditIdx(-1)}
                      style={{
                        width: '100%',
                        padding: '3px 5px',
                        fontSize: 10,
                        textAlign: 'center',
                        borderRadius: 6,
                        border: '1px solid var(--ds-line2)',
                        background: 'var(--ds-bg)',
                        color: 'var(--ds-text)',
                        outline: 'none',
                        fontFamily: SANS,
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: 10,
                        color: on ? 'var(--ds-accent)' : 'var(--ds-muted)',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        fontWeight: on ? 600 : 500,
                      }}
                    >
                      {f.name}
                    </span>
                  )}
                  {isCustom && editIdx !== idx && (
                    <>
                      <span
                        title="Переименовать"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditIdx(idx);
                          setEditName(f.name);
                        }}
                        style={{
                          position: 'absolute',
                          top: 3,
                          left: 5,
                          fontSize: 10,
                          color: 'var(--ds-faint)',
                          cursor: 'pointer',
                        }}
                      >
                        ✎
                      </span>
                      <span
                        title="Удалить"
                        onClick={(e) => {
                          e.stopPropagation();
                          const ci = idx - frameDefs.length;
                          const cf = customFrames.slice();
                          cf.splice(ci, 1);
                          setCustomFrames(cf);
                          if (activeFrame >= frameDefs.length + cf.length) setActiveFrame(0);
                        }}
                        style={{
                          position: 'absolute',
                          top: 3,
                          right: 5,
                          fontSize: 11,
                          color: 'var(--ds-faint)',
                          cursor: 'pointer',
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Lbl>Своя рамка PNG</Lbl>
          <div
            className="tc-drop"
            style={dropStyle}
            onClick={() => pickFile(true)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              loadFile(e.dataTransfer.files[0], true);
            }}
          >
            Перетащите PNG-рамку или нажмите для загрузки
          </div>
          {pendingFrame && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              <Field
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Название рамки…"
                inputProps={{
                  onKeyDown: (e) => {
                    if (e.key === 'Enter') addToCollection();
                  },
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <Button onClick={addToCollection} style={{ flex: 1, padding: 8, fontSize: 12 }}>
                  + Добавить
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPendingFrame(null)}
                  style={{ padding: '8px 12px', fontSize: 12 }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>

        <div>
          <Lbl>Размер экспорта</Lbl>
          <div style={{ display: 'flex', gap: 6 }}>
            {[256, 512, 1024].map((sz) => {
              const on = sz === exportSize;
              return (
                <button
                  key={sz}
                  className="ddtb-btn"
                  onClick={() => setExportSize(sz)}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontFamily: SANS,
                    fontSize: 12,
                    fontWeight: 600,
                    color: on ? 'var(--ds-accent)' : 'var(--ds-muted)',
                    background: on ? 'var(--ds-glow)' : 'transparent',
                    border: `1px solid ${on ? 'var(--ds-line)' : 'var(--ds-line2)'}`,
                  }}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        <Field
          label="Имя файла"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="token"
        />

        <Button
          onClick={doExport}
          icon={<Icon name="back" size={16} style={{ transform: 'rotate(-90deg)' }} />}
          style={{ marginTop: 'auto', padding: 12, fontSize: 13.5 }}
        >
          Экспорт PNG · {exportSize}px
        </Button>
      </div>

      {/* stage */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(var(--ds-line2) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            opacity: 0.6,
          }}
        />
        <canvas
          ref={canvasRef}
          width={S}
          height={S}
          style={{
            position: 'relative',
            width: 'min(58vh, 460px)',
            height: 'min(58vh, 460px)',
            borderRadius: '50%',
            cursor: charImg ? 'grab' : 'default',
            boxShadow: '0 20px 60px rgba(0,0,0,.45)',
          }}
        />
        <div
          style={{
            position: 'relative',
            marginTop: 20,
            fontSize: 12,
            color: 'var(--ds-faint)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--ds-muted)' }}>
            {getFrame(activeFrame) ? getFrame(activeFrame).name : ''}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: 3, background: 'var(--ds-faint)' }} />
          Колесо — масштаб · перетаскивание — позиция
        </div>
      </div>
    </div>
  );
}
