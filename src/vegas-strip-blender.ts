import { videosInDir, videoPrePend, clips as clipsIn } from "./vegas-strip";

const videosOutDir = `${videosInDir}/processedBlender`;
//const videosOutFilename = `${videosOutDir}/strip`;
const videosOutFilename = null;

const toMnS = secs => {
  if (secs < 60) return { s: secs };
  else {
    const m = Math.floor(secs / 60);
    const s = secs - m * 60;
    return { m, s };
  }
};

const tDec = ({ m, s }) => {
  const t = m ? m * 60 : 0 + s - 3;
  return toMnS(t < 0 ? 0 : t);
};

const tInc = ({ m, s }) => toMnS(m ? m * 60 : 0 + s + 3);

let first = true;
const clips = {};
Object.keys(clipsIn).map(vClip => {
  clips[vClip] = clipsIn[vClip].map(c => ({
    from: tDec(c.from),
    to: tInc(c.to)
  }));
});

export { videosInDir, videosOutDir, videosOutFilename, videoPrePend, clips };
