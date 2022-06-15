class NumberHelper {
    static rand(length = 6) {
        let generatedCode = "";
        for (let index = 0; index < length; index++) {
            generatedCode += Math.floor(Math.random() * 10)
                .toString()
                .substr(0, 1);
        }
        return generatedCode;
    }
}

module.exports = NumberHelper;
