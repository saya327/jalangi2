/*
 * Copyright 2014 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT


// wrap in anonymous function to create local namespace when in browser
// create / reset J$ global variable to hold analysis runtime
if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    if (typeof sandbox.B !== 'undefined') {
        return;
    }
    //----------------------------------- Begin Jalangi Library backend ---------------------------------

    // stack of return values from instrumented functions.
    // we need to keep a stack since a function may return and then
    // have another function call in a finally block (see test
    // call_in_finally.js)

    var lastVal;
    var EVAL_ORG = eval;
    var SPECIAL_PROP_IID = sandbox.Constants.SPECIAL_PROP_IID;


    function associateFunidWithFunction(f, funid) {
        if (typeof f === 'function') {
            if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                Object.defineProperty(f, SPECIAL_PROP_IID, {
                    enumerable: false,
                    writable: true
                });
            }
            f[SPECIAL_PROP_IID] = funid;
        }
    }

    var hasGetOwnPropertyDescriptor = typeof Object.getOwnPropertyDescriptor === 'function';
    // object/function/regexp/array Literal
    function T(iid, funid, sid, invocationCounter, calleeId, val, idsOfGetterSetters) {
        if (idsOfGetterSetters) {
            var tmp;
            for (var offset in idsOfGetterSetters) {
                if (hasGetOwnPropertyDescriptor && idsOfGetterSetters.hasOwnProperty(offset)) {
                    var desc = Object.getOwnPropertyDescriptor(val, offset.substring(3));
                    var type = offset.substring(0, 3);
                    if (type === 'get') {
                        tmp = idsOfGetterSetters[offset];
//                        associateFunidWithFunction(desc.get, tmp);
                        if (sandbox.analysis && sandbox.analysis.literal) {
                            sandbox.analysis.literal(iid, funid, sid, invocationCounter, tmp, desc.get);
                        }
                    } else {
                        tmp = idsOfGetterSetters[offset];
//                        associateFunidWithFunction(desc.set, tmp);
                        if (sandbox.analysis && sandbox.analysis.literal) {
                            sandbox.analysis.literal(iid, funid, sid, invocationCounter, tmp, desc.set);
                        }
                    }
                }
            }
        }
//        associateFunidWithFunction(val, calleeId);
        if (sandbox.analysis && sandbox.analysis.literal) {
            sandbox.analysis.literal(iid, funid, sid, invocationCounter, calleeId, val);
        }
        return val;
    }


    var invocationCounter = 0;

    // Function enter
    function Fe(iid, funid, sid) {
        invocationCounter++;
        if (sandbox.analysis && sandbox.analysis.functionEnter) {
            sandbox.analysis.functionEnter(iid, funid, sid, invocationCounter);
        }
        return invocationCounter;
    }

    // Function exit
    function Fr(iid, funid, sid, invocationCounter, val) {
        if (sandbox.analysis && sandbox.analysis.functionExit) {
            sandbox.analysis.functionExit(iid, funid, sid, invocationCounter);
        }
        return val;
    }

    // Script enter
    function Se(iid, funid, sid) {
        invocationCounter++;
        if (sandbox.analysis && sandbox.analysis.scriptEnter) {
            sandbox.analysis.scriptEnter(iid, funid, sid, invocationCounter);
        }
        return invocationCounter;
    }

    // Script exit
    function Sr(iid, funid, sid, invocationCounter) {
        if (sandbox.analysis && sandbox.analysis.scriptExit) {
            sandbox.analysis.scriptExit(iid, funid, sid, invocationCounter);
        }
    }


    // Modify and assign +=, -= ...
    function last() {
        return lastVal;
    }

    // Switch key
    // E.g., for 'switch (x) { ... }',
    // C1 is invoked with value of x
    function C1(iid, funid, sid, invocationCounter, val) {
        return val;
    }

    // case label inside switch
    function C2(iid, funid, sid, invocationCounter, left, right) {
        var result;

        result = (left === right);
        if (sandbox.analysis && sandbox.analysis.conditional) {
            sandbox.analysis.conditional(iid, funid, sid, invocationCounter, result);
        }
        return right;
    }

    // Expression in conditional
    function C(iid, funid, sid, invocationCounter, val) {
        if (sandbox.analysis && sandbox.analysis.conditional) {
            sandbox.analysis.conditional(iid, funid, sid, invocationCounter, val);
        }

        lastVal = val;
        return val;
    }

    function S(iid, funid, sid) {
        if (sandbox.analysis && sandbox.analysis.runInstrumentedFunctionBody) {
            return sandbox.analysis.runInstrumentedFunctionBody(iid, funid, sid);
        }
        return true;
    }

    function endExecution() {
        if (sandbox.analysis && sandbox.analysis.endExecution) {
            return sandbox.analysis.endExecution();
        }
    }


    function log(str) {
        if (sandbox.Results && sandbox.Results.execute) {
            sandbox.Results.execute(function (div, jquery, editor) {
                div.append(str + "<br>");
            });
        } else {
            console.log(str);
        }
    }


    //----------------------------------- End Jalangi Library backend ---------------------------------

    sandbox.C = C; // Condition
    sandbox.C1 = C1; // Switch key
    sandbox.C2 = C2; // case label C1 === C2
    sandbox._ = last;  // Last value passed to C

    sandbox.T = T; // object/function/regexp/array Literal
    sandbox.Fe = Fe; // Function enter
    sandbox.Fr = Fr; // Function return
    sandbox.Se = Se; // Script enter
    sandbox.Sr = Sr; // Script return
    sandbox.endExecution = endExecution;

    sandbox.S = S;

    sandbox.EVAL_ORG = EVAL_ORG;
    sandbox.log = log;
})(J$);

