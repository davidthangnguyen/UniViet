/**
 * Test script for Tone Repositioning Logic
 * Run with: node test-tone-reposition.js
 */

// Load UniVietCore (simulate browser environment)
global.window = {};
eval(require('fs').readFileSync('./univiet-core.js', 'utf8'));
const UniVietCore = global.window.UniVietCore;

const univiet = new UniVietCore();

function testSequence(keys, expectedResult, description) {
    let word = '';
    const steps = [];

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const processResult = univiet.processKey(word, key);

        if (processResult && processResult.shouldReplace) {
            if (processResult.replaceAt !== undefined) {
                // Replace at specific position
                const replacePos = word.length - processResult.replaceAt - 1;
                word = word.substring(0, replacePos) + processResult.text + word.substring(replacePos + 1);
            } else if (processResult.deleteCount) {
                // Delete and add
                const deleteStart = word.length - processResult.deleteCount;
                word = word.substring(0, deleteStart) + processResult.text;
            } else {
                // Just add
                word = word + processResult.text;
            }
        } else {
            // Normal character
            word = word + key;
        }

        steps.push(word);
    }

    const passed = word === expectedResult;

    console.log(`\n${passed ? '✅' : '❌'} ${description}`);
    console.log(`   Input:    ${keys.join('')}`);
    console.log(`   Expected: ${expectedResult}`);
    console.log(`   Got:      ${word}`);
    console.log(`   Steps:    ${steps.join(' → ')}`);

    return passed;
}

console.log('🧪 Running Tone Repositioning Tests...\n');
console.log('='.repeat(70));

const tests = [
    {
        keys: ['h', 'i', 'f', 'e', 'e', 'n'],
        expected: 'hiền',
        description: 'Test 1: hifeen → hiền (bug chính)'
    },
    {
        keys: ['t', 'o', 'f', 'i', 's'],
        expected: 'tói',
        description: 'Test 2: tofis → tói (2 nguyên âm + phụ âm cuối)'
    },
    {
        keys: ['t', 'o', 'f', 'i'],
        expected: 'tòi',
        description: 'Test 3: tofi → tòi (2 nguyên âm không phụ âm cuối)'
    },
    {
        keys: ['q', 'u', 'a', 'f', 'e', 'y'],
        expected: 'quáy',
        description: 'Test 4: quafey → quáy (3 nguyên âm, dấu ở giữa)'
    },
    {
        keys: ['h', 'o', 'a', 'f', 't'],
        expected: 'hoạt',
        description: 'Test 5: hoaft → hoạt (undo dấu cho vần oa)'
    },
    {
        keys: ['v', 'i', 'e', 'e', 's', 't'],
        expected: 'việt',
        description: 'Test 6: vieest → việt (ee → ê, dấu sắc)'
    },
    {
        keys: ['d', 'd', 'i', 'e', 'e', 'u', 'f'],
        expected: 'điều',
        description: 'Test 7: ddieeuf → điều (3 nguyên âm, dd, dấu huyền)'
    },
    {
        keys: ['t', 'h', 'u', 'o', 'o', 'c', 'x'],
        expected: 'thuộc',
        description: 'Test 8: thuoocx → thuộc (oo → ô, dấu ngã)'
    },
    {
        keys: ['c', 'h', 'i', 'e', 'e', 'f', 'n'],
        expected: 'chiền',
        description: 'Test 9: chieefn → chiền (dấu huyền sau khi ee)'
    },
    {
        keys: ['n', 'g', 'h', 'i', 'e', 'e', 'r', 'm'],
        expected: 'nghiểm',
        description: 'Test 10: nghieerm → nghiểm (dấu hỏi + phụ âm cuối)'
    }
];

let passed = 0;
let failed = 0;

tests.forEach(test => {
    if (testSequence(test.keys, test.expected, test.description)) {
        passed++;
    } else {
        failed++;
    }
});

console.log('\n' + '='.repeat(70));
console.log('\n📊 Test Summary:');
console.log(`   Total:  ${tests.length} tests`);
console.log(`   ✅ Pass: ${passed}`);
console.log(`   ❌ Fail: ${failed}`);
console.log(`   Rate:   ${((passed / tests.length) * 100).toFixed(1)}%\n`);

process.exit(failed > 0 ? 1 : 0);
