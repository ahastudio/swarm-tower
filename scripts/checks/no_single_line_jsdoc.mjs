const message = "한 줄 JSDoc(`/** 설명 */`)은 쓰지 않는다. 한 줄이어도 `/**`, ` * 설명`, ` */` 세 줄로 쓴다.";

/**
 * 한 줄로 쓴 JSDoc 주석을 찾아 오류로 보고하는 ESLint 규칙이다.
 */
const rule = {
  meta: { type: "problem", schema: [], messages: { singleLine: message } },
  create(context) {
    return {
      Program() {
        const comments = context.sourceCode.getAllComments();
        const singleLine = comments.filter(
          (comment) => comment.type === "Block" && comment.value.startsWith("*") && comment.loc.start.line === comment.loc.end.line,
        );
        singleLine.forEach((comment) => context.report({ loc: comment.loc, messageId: "singleLine" }));
      },
    };
  },
};

export default { rules: { "no-single-line-jsdoc": rule } };
