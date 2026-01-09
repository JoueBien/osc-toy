# @joue-bien/osc-ts

A typescript library for sending OSC (Version 1.1 Only - must contain arg types) messages over UDP. This library focuses on sending messages in the node run time & is not suitable for running in a browser.

While there is scope for other networking protocols other than UDP, I am only interested in UDP. This library is primarily tested with the X32, as that is the only OSC hardware I have.

# Further reading

- [dgram](https://nodejs.org/api/dgram.html) - Node's socket Documentation.
- [OSC 1.1](https://opensoundcontrol.stanford.edu/spec-1_1.html) - Open Sound Control documentation.
- [@joue-bien/audio-transport](https://github.com/JoueBien/audio-transport#readme) - The library used for the underlying UDP transport.
- [Fail Up](https://www.npmjs.com/package/fail-up) - The error handling library.

## Install

`npm install @joue-bien/osc-ts`

# Usage

## Transport as a Client

### Connecting

```typescript
import { UdpTransport, OscTransport } from "@joue-bien/osc-ts";

// Set up the UDP client.
const udpTransport = new UdpTransport({
  remotePort: 9000, // Remote port to send messages to.
  remoteAddress: "192.168.1.40", // Remote IP address to send messages to.
  responsePort: 1023, // Port for the remote OSC server to reply to.
});

// Set up the OSC client and connect.
const client = new OscTransport(udpTransport);
const cleanUpController = await client.connect();
```

### Sending messages

A connected transport can send messages to a remote OSC server.

```typescript
client.send({
  address: "/fader/01",
  args: [{ f: 0.5 }],
});
```

## Transport as a Server

### Start listening

```typescript
import { UdpTransport, OscTransport } from "@joue-bien/osc-ts";

const udpTransport = new UdpTransport({
  responsePort: 9000,
});

const server = new OscTransport(udpTransport);
const cleanUpController = await server.listen();
```

### Responding to messages

When the transport is listening, it can send messages back to any clients that have sent it messages.

```typescript
// Sending a message to a known client.
await server.respond({
  address: "/message",
  args: [{ i: 1234 }],
  remoteAddress: "localhost",
  remotePort: 9000,
});

// Sending a message to a client that sent the server a message.
server.onAnyMessage((params: { decoded; rinfo }) => {
  const { address, port } = rinfo;
  server.respond({
    address: "/message",
    args: [{ i: 1234 }],
    remoteAddress: address,
    remotePort: port,
  });
});
```

## Listening for messages

Both the server and client can listen for messages.

### Message types

A generic is supplied for OSC values. Supported are; integer, float, string, byte array (X32 tested only), boolean, infinity and null.

You can import the generic using the following:

```typescript
import { type Arg } from "@joue-bien/osc-ts";

const arguments: Arg[] = [{ f: 0.5 }, { i: 1 }];
```

Specific value types are also provided in the case you need to specify a single one. You can import these by using the following:

```typescript
import {
  type IntArg, // integer
  type FloatArg, // float
  type StringArg, // string
  type TrueArg, // boolean true
  type FalseArg, // boolean false
  type InfinityArg, // infinity
  type NullArg, // null
} from "@joue-bien/osc-ts";

const intArgument: IntArg = { i: 1234 };
const floatArgument: FloatArg = { f: 1234.124 };
const stringArgument: StringArg = { s: "fader" };
const booleanArgument: TrueArg = { T: true };
const booleanArgument: FalseArg = { F: false };
const infinityArgument: InfinityArg = { I: Infinity };
const nullArgument: FalseArg = { N: null };
```

### On any message

`onAnyMessage` is used to add a function that is called when any message is received.

```typescript
const cleanUp = transport.onAnyMessage((params: { msg; decoded; rinfo }) => {
  console.log(msg, decoded, rinfo);
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

### On any message once

`onOnceAnyMessage` is used to add function that is called when the next message is received.

```typescript
const cleanUp = transport.onOnceAnyMessage(
  (params: { msg; decoded; rinfo }) => {
    console.log(msg, decoded, rinfo);
  }
);

// Un-register the function by calling the returned clean up.
cleanUp();
```

### On a message matching an OSC address

`onMessage` is used to add function that is called when message is received with a known OSC address.

```typescript
const cleanUp = transport.onMessage({
  address: "/osc/address",
  callBack: (params: { msg; decoded; rinfo }) => {
    console.log(msg, decoded, rinfo);
  },
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

### On a message matching an OSC address once

`onOnceMessage` is used to add a function that is called when the next message is received with a known OSC address.

```typescript
const cleanUp = transport.onOnceMessage({
  address: "/osc/address",
  callBack: (params: { msg; decoded; rinfo }) => {
    console.log(msg, decoded, rinfo);
  },
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

### Wait for a specific message using async await

`waitForMessage` is used to wait for the next message with a known OSC address.

```typescript
const { msg, decoded, rinfo } = await transport.waitForMessage({
  address: "/osc/address",
});
```

Note that if a message is not received with in 500 milliseconds `waitForMessage` will return an error instead. You can specify a custom time out by passing in a custom `exitMs` value.

### Send a message and wait for a specific reply

```typescript
const { msg, decoded, rinfo } = await transport.sendAndWaitForMessage({
  send: {
    address: "/osc/address",
    args: [],
  },
  listen: {
    address: "/osc/respond/address",
  },
});
```

Note that if a message is not received with in 500 milliseconds `sendAndWaitForMessage` will return an error instead. You can specify a custom time out by passing in a custom `exitMs` value.

## Handling errors

### On any error

Register a function to run when any error is received.

```typescript
const cleanUp = transport.onError((error) => {
  console.log(error);
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

### On single error

Register a function to run when the next error is received.

```typescript
const cleanUp = transport.onOnceError((error) => {
  console.log(error);
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

## Disconnecting

To stop the transports connection and to release the response/remote ports you need to call abort on the OSC transports abort controller.

```typescript
transport.cleanUpController.abort();
```

Once the OSC transport has been aborted the OSC transport and UDP transport are done and ready to be trash collected. If you want to re-establish a connection or change/update a connection you must create new instances.

If you try to add a new listener or send a message with an aborted transport an error will be returned instead.

## Mocked transport

A mock is included to help with the writing of tests.
A good example can be found in this packages `src/OscTransport.spec.ts` file.

```typescript
let serverPtr: MockOscServer;

describe("OscTransport", () => {
  beforeAll(async () => {
    serverPtr = await mockOscServer();
  });

  afterAll(() => {
    // Make sure to clean up, otherwise your test will leak & leave sockets open.
    serverPtr.controller.abort();
  });
});
```

## Error handling

Errors are always returned or provided as a value rather than throwing. This forces you into handling all error paths rather than ignoring errors or missing them. The error type is accessible from the type member.

```typescript
const error = new Failure({
  message: "error message",
  type: "send-failure",
});

if (error.type === "send-failure") {
  // Handle error.
  return;
}
```
