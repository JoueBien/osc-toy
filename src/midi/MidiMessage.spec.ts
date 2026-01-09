import { delay, timestamp } from "@joue-bien/audio-transport";
import { MidiMessage } from "./MidiMessage";

describe("MidiMessage", () => {
  it("encodes and decodes sessions", () => {
    const buffer = MidiMessage.encodeSession({
      name: "Virtual Faders",
      command: "OK",
    });

    const message = MidiMessage.decodeSession(buffer);

    console.log("1234", message);

    expect(message).toMatchObject({
      command: "OK",
      version: 2,
      token: 124,
      ssrc: 1003,
      name: "Virtual Faders",
    });
  });

  it("encodes and decodes session timestamps", async () => {
    const ts0 = timestamp.nowRTP();
    await delay({ ms: 1 / 100 });
    const ts1 = timestamp.nowRTP();
    await delay({ ms: 1 / 100 });
    const ts2 = timestamp.nowRTP();

    const buffer0 = MidiMessage.encodeSessionTimestamp({
      timestamps: [ts0],
    });

    const buffer1 = MidiMessage.encodeSessionTimestamp({
      timestamps: [ts0, ts1],
    });

    const buffer2 = MidiMessage.encodeSessionTimestamp({
      timestamps: [ts0, ts1, ts2],
    });

    const message0 = MidiMessage.decodeSessionTimestamp(buffer0);
    const message1 = MidiMessage.decodeSessionTimestamp(buffer1);
    const message2 = MidiMessage.decodeSessionTimestamp(buffer2);

    expect(message0).toMatchObject({
      command: "CK",
      count: 0,
      timestamps: [ts0],
    });

    expect(message1).toMatchObject({
      command: "CK",
      count: 1,
      timestamps: [ts0, ts1],
    });

    expect(message2).toMatchObject({
      command: "CK",
      count: 2,
      timestamps: [ts0, ts1, ts2],
    });
    console.log({
      message0,
      message1,
      message2,
    });
  });
});
