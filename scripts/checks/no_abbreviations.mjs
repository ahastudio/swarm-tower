const SHORT_WORDS = new Set(["id", "ok", "ui", "io", "to", "in", "of", "is", "on", "up", "as", "at", "by", "or", "if", "no", "x", "y", "z"]);
const BANNED_WORDS = new Set([
  "acc", "arg", "args", "arr", "btn", "calc", "cb", "cfg", "conf", "ctx", "cur", "curr", "dist", "dpr", "dst", "elem", "err",
  "evt", "func", "idx", "img", "impl", "info", "init", "len", "lvl", "mgr", "msg", "num", "obj", "param", "params", "pos", "prev", "ptr",
  "str", "temp", "tmp", "val", "vel",
]);

/**
 * 이름을 낱말(camelCase와 snake_case 기준)로 나눠 소문자로 돌려준다.
 */
const wordsOf = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[\s_]+/).filter(Boolean).map((word) => word.toLowerCase());

/**
 * 줄임말이 든 낱말을 찾는다. 한 글자는 좌표 x, y, z만, 두 글자 이하는 정해진 낱말만 허용한다.
 * 도메인에서 굳은 용어(문서에 뜻을 적은 것)는 규칙 옵션 allow로 허용한다.
 */
const abbreviationOf = (name, allowed) =>
  wordsOf(name).find((word) => !allowed.has(word) && (BANNED_WORDS.has(word) || (word.length <= 2 && !SHORT_WORDS.has(word))));

/**
 * 선언하는 자리의 식별자만 모은다. 사용하는 자리는 선언한 이름을 따르므로 따로 보지 않는다.
 */
const declaredIdentifiers = (node) => {
  if (node.type === "VariableDeclarator") {
    return patternIdentifiers(node.id);
  }
  if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") {
    return [...(node.id ? [node.id] : []), ...node.params.flatMap(patternIdentifiers)];
  }
  if (node.type === "Property" && node.parent.type === "ObjectExpression" && !node.computed) {
    return node.key.type === "Identifier" ? [node.key] : [];
  }
  if (node.type === "TSPropertySignature" || node.type === "PropertyDefinition" || node.type === "MethodDefinition") {
    return node.key.type === "Identifier" ? [node.key] : [];
  }
  if (node.type === "TSTypeAliasDeclaration" || node.type === "TSInterfaceDeclaration") {
    return [node.id];
  }
  return [];
};

/**
 * 구조 분해와 기본값까지 풀어 식별자를 모은다.
 */
const patternIdentifiers = (pattern) => {
  if (pattern.type === "Identifier") {
    return [pattern];
  }
  if (pattern.type === "ObjectPattern") {
    return pattern.properties.flatMap((property) => patternIdentifiers(property.type === "RestElement" ? property.argument : property.value));
  }
  if (pattern.type === "ArrayPattern") {
    return pattern.elements.filter(Boolean).flatMap(patternIdentifiers);
  }
  if (pattern.type === "AssignmentPattern") {
    return patternIdentifiers(pattern.left);
  }
  return pattern.type === "RestElement" ? patternIdentifiers(pattern.argument) : [];
};

/**
 * 이름에 줄임말을 쓰는 것을 오류로 보고하는 ESLint 규칙이다.
 */
const rule = {
  meta: {
    type: "problem",
    schema: [{ type: "object", properties: { allow: { type: "array", items: { type: "string" } } }, additionalProperties: false }],
    messages: { abbreviation: "「{{name}}」은 줄임말이다. 낱말을 풀어 쓴다(예: dt는 deltaSeconds, tx는 targetX, i는 index). 한 글자 이름은 좌표 x, y, z만 쓴다." },
  },
  create(context) {
    const allowed = new Set(context.options[0]?.allow ?? []);
    const check = (node) => {
      declaredIdentifiers(node)
        .filter((identifier) => abbreviationOf(identifier.name, allowed))
        .forEach((identifier) => context.report({ node: identifier, messageId: "abbreviation", data: { name: identifier.name } }));
    };
    return {
      VariableDeclarator: check,
      FunctionDeclaration: check,
      FunctionExpression: check,
      ArrowFunctionExpression: check,
      Property: check,
      TSPropertySignature: check,
      PropertyDefinition: check,
      MethodDefinition: check,
      TSTypeAliasDeclaration: check,
      TSInterfaceDeclaration: check,
    };
  },
};

export default { rules: { "no-abbreviations": rule } };
