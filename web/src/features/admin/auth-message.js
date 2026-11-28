export function validateChallenge(
  challenge,
  { host, origin, account, now = Date.now() },
) {
  const message = challenge?.message;
  const invalid = () => {
    throw new Error(
      "ข้อความเข้าสู่ระบบไม่ตรงกับเว็บไซต์ เครือข่าย หรือหมดอายุแล้ว",
    );
  };
  if (
    typeof message !== "string" ||
    !message.startsWith(
      `${host} wants you to sign in with your Ethereum account:\n${account}\n`,
    ) ||
    !/^[a-zA-Z0-9]{8,}$/.test(challenge.nonce)
  )
    invalid();
  const lines = message.split("\n");
  const field = (name) => {
    const matches = lines.filter((line) => line.startsWith(`${name}: `));
    if (matches.length !== 1) invalid();
    return matches[0].slice(name.length + 2);
  };
  if (
    field("URI") !== origin ||
    field("Version") !== "1" ||
    field("Chain ID") !== "11155111" ||
    field("Nonce") !== challenge.nonce
  )
    invalid();
  const issued = Date.parse(field("Issued At"));
  const expires = Date.parse(field("Expiration Time"));
  if (
    !Number.isFinite(issued) ||
    !Number.isFinite(expires) ||
    issued > now + 60000 ||
    issued < now - 600000 ||
    expires <= now ||
    expires > now + 600000 ||
    expires <= issued
  )
    invalid();
  return message;
}
