import { MantarayNode } from "../src/node";

const uint8ArrayToHexString = (byteArray: Uint8Array): string => Array.from(byteArray).reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

const uint8ArrayToString = (byteArray: Uint8Array): string => new TextDecoder().decode(byteArray);

const logNode = (node: MantarayNode, reference: string, path: string): void => {
  const logPath = path === "" ? "" : "/" + path.replace(/^\//, "");
  console.log(reference, logPath, node.getMetadata || "");
  // console.log(node);
};

const logForks = async (node: MantarayNode, path = ""): Promise<void> => {
  for (const fork of Object.values(node.forks || {})) {
    const reference = uint8ArrayToHexString(fork.node.getEntry!);
    const newPath = path + uint8ArrayToString(fork.prefix);

    if (fork.node.isValueType()) logNode(fork.node, reference, newPath);
    if (fork.node.isEdgeType()) await logRef(reference, newPath);
  }
};

const logRef = async (reference: string, path = ""): Promise<void> => {
  const res = await fetch(`${beeUrl}/bytes/${reference}`);
  const data = new Uint8Array(await res.arrayBuffer());
  const node = new MantarayNode();
  node.deserialize(data);

  logNode(node, reference, path);
  await logForks(node, path);
};

const beeUrl = process.argv[3] || "http://127.0.0.1:1633";
logRef(process.argv[2]);
