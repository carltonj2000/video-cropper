const videosInDir = "/Users/carltonjoseph/Pictures/pics2020/vegas";
const videosOutDir = `${videosInDir}/processed`;
const videosOutFilename = `${videosOutDir}/strip`;
const videoPrePend = "v";

const clips = {
  "strip1.mov": [
    { from: { s: 1 }, to: { s: 30 } },
    { from: { s: 37 }, to: { s: 50 } }
  ],
  "VID_20200321_162428.mp4": [],
  "VID_20200321_162529.mp4": [],
  "VID_20200321_162501.mp4": [{ from: { s: 1 }, to: { s: 14 } }],
  "VID_20200321_162614.mp4": [{ from: { s: 2 }, to: { s: 15 } }],
  "VID_20200321_162756.mp4": []
};

export { videosInDir, videosOutDir, videosOutFilename, videoPrePend, clips };
