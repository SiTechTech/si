"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BsvFunction = exports.BsvPackage = void 0;
function tuple(...args) {
    return args;
}
const trait = (Orig) => (Tgt) => {
    // perform patching
    return Tgt; // assertion required
};
class BsvScope {
}
class BsvIdentifier {
}
const BsvPackageMixin = trait(BsvScope)(trait(BsvIdentifier)(class {
}));
const BsvFunctionMixin = trait(BsvScope)(trait(BsvIdentifier)(class {
}));
const BsvMethodMixin = trait(BsvScope)(trait(BsvIdentifier)(class {
}));
const BsvModuleMixin = trait(BsvScope)(trait(BsvIdentifier)(class {
}));
class BsvPackage extends BsvPackageMixin {
    constructor(id) {
        super();
    }
}
exports.BsvPackage = BsvPackage;
class BsvFunction extends BsvFunctionMixin {
    constructor(id) {
        super();
    }
}
exports.BsvFunction = BsvFunction;
//# sourceMappingURL=bsvLanguage.js.map