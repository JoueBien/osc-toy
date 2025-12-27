# @joue-bien/osc-ts

A typescript library for sending OSC (Version 1.1 Only) messages over UDP. This library focuses on sending messages in the node run time & is not suitable for running in a browser.

While there is scope for other networking protocols other than UDP I am only interested in UDP. This library is primarily tested with the X32, as that is the only OSC hardware I have.

## Further reading

- [OSC 1.1](https://opensoundcontrol.stanford.edu/spec-1_1.html) - Documentation
- [Fail Up](https://www.npmjs.com/package/fail-up) - The error handling library

## Install

`npm install @joue-bien/osc-ts`

## Usage

### Connecting

```typescript
import { UdpClient, OscClient } from "@joue-bien/osc-ts";

// Set up the UDP client.
const uspClient = new UdpClient({
  remotePort: 9000, // Remote port to send messages to.
  remoteAddress: "192.168.1.40", // Remote IP address to send messages to.
  responsePort: 1023, // Port for the remote OSC server to reply to.
});

// set up the OSC client and connect
const client = new OscClient(uClient);
const cleanUpController = await client.connect();
```

### Disconnecting

To stop listeners and to release the response port you need to call abort on the OSC clients abort controller.

```typescript
client.cleanUpController.abort();
```

Once the OSC client has been aborted the OSC client and UDP client are done and ready to be trash collected. If you want to re-establish a connection or change/update a connection you must create new instances.

If you try to add a new listener or send a message with an aborted client an error will be returned instead.

### Send Messages

Messages can be sent to the remote OSC device.

```typescript
const client = new OscClient(uClient);
client.send({
  address: "/fader/01",
  // argsArray is optional.
  argsArray: [{ f: 0.5 }],
});
```

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
const infinityArgument: FalseArg = { I: Infinity };
const nullArgument: FalseArg = { N: null };
```

### Listening for a specific message

```typescript
// Register a function to run when message with a matching address is received.
const cleanUp = onMessage({
  address: "/fader/01",
  callBack: (message) => {
    const { address, argTypes, args } = message;
    console.log(address, argTypes, args);
  },
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

### Listening for a specific message once

```typescript
// Register a function to run when message with a matching address is received.
const cleanUp = onOnceMessage({
  address: "/fader/01",
  callBack: (message) => {
    // When a message matching the address is received  the callback will be automatically unregistered.
    const { address, argTypes, args } = message;
    console.log(address, argTypes, args);
  },
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

### Wait for a specific message using async await

```typescript
const message = await client.waitForMessage({
  address: "/fader/01",
});
```

Note that if a message is not received with in 1000 milliseconds `waitForMessage` will return an error instead. You can specify a custom time out by passing in a custom `exitMs` value.

```typescript
const message = await client.waitForMessage({
  address: "/fader/01",
  exitMs: 5000,
});
```

### Send a message and wait for a specific reply

```typescript
const message = await client.waitForMessage({
  send: {
    address: "/fader/01",
    args: [],
  },
  listen: {
    address: "/fader/01/value",
    exitMs: 5000,
  },
});
```

Note that if a message is not received with in 1000 milliseconds `waitForMessage` will return an error instead. You can specify a custom time out by passing in a custom `listen.exitMs` value.

### Listening for any message

```typescript
// Register a function to run when any message is received.
const cleanUp = onAnyMessage((message) => {
  const { address, argTypes, args } = message;
  console.log(address, argTypes, args);
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

### Listening for any message once

```typescript
// Register a function to run when any message is received.
const cleanUp = onOnceAnyMessage((message) => {
  // When a message is received the callback will be automatically unregistered.
  const { address, argTypes, args } = message;
  console.log(address, argTypes, args);
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

### Listening for any errors

```typescript
// Register a function to run when any error is received.
const cleanUp = onError((err) => {
  console.error(err);
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

### Listening for any errors once

```typescript
// Register a function to run when any error is received.
const cleanUp = onOnceError((err) => {
  // When a error is received the callback will be automatically unregistered.
  console.error(err);
});

// Un-register the function by calling the returned clean up.
cleanUp();
```

## Error handling

Errors are always returned or provided as a value rather than throwing. This forces you into handling all error paths rather than ignoring errors or missing them. The error type is accessible from the type member.

```typescript
const error = new Failure({
  message: "error message",
  type: "send-failure",
});

if (error.type === "send-failure") {
  // handle error
  return;
}
```
