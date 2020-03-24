import path from "path";
import fs from "fs";
import chalk from "chalk";
import { execSync } from "child_process";

import {
  videosInDir,
  videosOutDir,
  videosOutFilename,
  videoPrePend,
  clips
} from "./vegas-strip-blender";

console.log(chalk.yellow("Processing Start"));

const clipNameIdx = 1;
const clipName = (prepend, videoIn, clip) => {
  const abbr = videoIn.split(".")[0].slice(-3);
  const fromTo = ({ m, s }) => `${m ? `m${m}` : ""}_s${s}`;
  const videoAbbr = `${prepend}${clipNameIdx++}_${abbr}`;
  const clipOut = `${videoAbbr}${fromTo(clip.from)}${fromTo(clip.to)}.mp4`;
  return { videoAbbr, clipOut };
};

const clipDetails = {};
const videoFilesAbbr = {};
Object.keys(clips).forEach(videoIn => {
  const vIn = path.join(videosInDir, videoIn);
  clips[videoIn].forEach(clip => {
    const toS = ({ m, s }) => (m || 0) * 60 + s;
    const start = toS(clip.from);
    const to = toS(clip.to);
    const delta = to - start;
    const { videoAbbr, clipOut } = clipName(videoPrePend, videoIn, clip);
    const cOut = path.join(videosOutDir, clipOut);
    clipDetails[clipOut] = { ...clip, vIn, start, delta, cOut };
    videoFilesAbbr[videoAbbr] = true;
  });
});

//console.log(clipDetails);

if (!fs.existsSync(videosOutDir)) fs.mkdirSync(videosOutDir);

const processOrRemove = fs.readdirSync(videosOutDir).reduce(
  (a, file) => {
    if (clipDetails[file]) {
      a.skip.push(file);
      clipDetails[file].skip = true;
    } else {
      const s = file.split("_");
      if (s.length > 1 && videoFilesAbbr[`${s[0]}_${s[1]}`]) {
        a.remove.push(file);
      } else {
        a.ignored.push(file);
      }
    }
    return a;
  },
  { remove: [], skip: [], ignored: [] }
);

//console.log(processOrRemove);

if (processOrRemove.ignored.length) {
  console.log(`${chalk.blue("Ignored")}`);
  console.log(chalk.gray(processOrRemove.ignored.join(" ")));
}

processOrRemove.remove.map(file => {
  console.log(`  ${chalk.gray(file)} ${chalk.red("Removed")}`);
  fs.unlinkSync(path.join(videosOutDir, file));
});

const concat = [];
Object.keys(clipDetails).map(clipAbbr => {
  const { start, delta, cOut, vIn, skip } = clipDetails[clipAbbr];

  concat.push(cOut);
  if (skip) console.log(`${chalk.green(clipAbbr)} skipped`);
  else {
    const cmd =
      `ffmpeg -i ${vIn} -ss ${start} -t ${delta}` +
      ` -acodec copy -vcodec copy ${cOut}`;
    console.log(`${chalk.greenBright(clipAbbr)} processing`);
    execSync(cmd, { stdio: "ignore" });
  }
});

if (videosOutFilename) {
  const ffconcat = path.join(videosOutDir, "ffconcat.txt");
  const out = concat.map(f => `file '${f}`).join("\n");
  fs.writeFileSync(ffconcat, out);
  const cmd =
    `ffmpeg -f concat -safe 0 -i ${ffconcat} -c copy -y` +
    ` ${videosOutFilename}.mp4`;
  execSync(cmd, { stdio: "ignore" });
  console.log(
    `${chalk.magenta(videosOutFilename.split("/").splice(-1))} output`
  );
}

console.log(chalk.yellow("Processing Finish"));
