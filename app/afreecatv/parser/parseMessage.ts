export default function parseMessage(message: ArrayBuffer): string[] {
  return new TextDecoder().decode(message).substring(1).trim().split('\u000c');
}
