var mock_num = '_n_';
var mock_op = '_o_';

var mock_tree = {};
mock_tree[0] = [mock_num];
var generate_mock_tree = function(n){
    if (!(n in mock_tree)){
        mock_tree[n] = [];
        for (var i=0; i < n; ++i){
            var left_childs = generate_mock_tree(i);
            var right_childs = generate_mock_tree(n-i-1);
            for (l in left_childs){
                for (r in right_childs){
                    mock_tree[n].push( {'left': left_childs[l], 'right': right_childs[r], 'op': mock_op} );
                }
            }
        }
    }
    return mock_tree[n];
}

var compute = function(op_tree){
    if (typeof(op_tree) === 'string'){
        return parseInt(op_tree);
    }
    var op = op_tree['op'];
    var left_value = compute(op_tree['left']);
    var right_value = compute(op_tree['right']);
    if (op == '+') {
        return left_value + right_value;
    }
    else if (op == '-'){
        return left_value - right_value;
    }
    else if (op == '*'){
        return left_value * right_value;
    }
    else if (op == '/'){
        return left_value / right_value;
    }
    else if (op == '**'){
        return Math.pow(left_value, right_value);
    }
    else if (op == '<<'){
        return left_value << right_value;
    }
    else if (op == '>>'){
        return left_value >> right_value;
    }
    else {
        return null;
    }
}

var get_equation_str = function(op_tree){
    if (typeof(op_tree) === 'string'){
        return op_tree;
    }
    var op = op_tree['op'];
    var left_eq = get_equation_str(op_tree['left']);
    var right_eq = get_equation_str(op_tree['right']);
    return '(' + left_eq + ' ' + op + ' ' + right_eq + ')';
}


var getPermutations = function(choices, n){
    if (n > choices.length) return [];
    var all_permutation = [];
    var choices_count = {}
    for (var i in choices){
        var choice = choices[i];
        if (choice in choices_count) choices_count[choice] += 1;
        else choices_count[choice] = 1;
    }

    var get_perm_with_choices_count = function ( cur_state, result, n, choices_count){
        if (cur_state.length >= n){
            result.push(cur_state.slice());
            return true;
        }
        var has_choice = false;
        for (var choice in choices_count){
            //choice = choices[i];
            has_choice = true;
            cur_state.push(choice);
            var choice_count = choices_count[choice];
            if (choice_count <= 0){
                delete choices_count[choice];
                continue;
            }
            else if (choice_count <= 1){
                delete choices_count[choice];
            }
            else {
                choices_count[choice] -= 1;
            }
            get_perm_with_choices_count(cur_state, result, n, choices_count);
            cur_state.pop();
            if (choice in choices_count) choices_count[choice] += 1;
            else choices_count[choice] = 1;
        }
        return true;
    }
    get_perm_with_choices_count([], all_permutation, n, choices_count);
    return all_permutation;
}

var solve = function(input, target, ops){
    var clean_input = input.trim().replace(/\s\s+/g, ' ');
    var nums = clean_input.trim().split(' ');
    if (typeof(ops) === 'undefined'){
        ops = ['+', '-', '*', '/', '>>', '<<']
    }
    var old_ops = ops.slice();

    var n_num = nums.length;
    var n_op = n_num-1;
    //Repeat the ops so that we can repeat same operation
    for (var i=0; i < n_op-1; ++i) ops = ops.concat(old_ops);

    var tree_choices = generate_mock_tree(n_op);
    var ops_choices = getPermutations(ops, n_op);
    var nums_choices = getPermutations(nums, n_num);

    var solution_eq = '';
    var has_solution = false;

    for (var nums_id in nums_choices){
        var cur_nums = nums_choices[nums_id];
        for (var ops_id in ops_choices){
            var cur_ops = ops_choices[ops_id];
            for (var tree_id in tree_choices){
                var cur_mock_tree = tree_choices[tree_id];
                var cur_tree_str = JSON.stringify(cur_mock_tree);
                for (var i=0; i < n_num; ++i){
                    cur_tree_str = cur_tree_str.replace(mock_num, cur_nums[i]);
                }
                for (var i=0; i < n_op; ++i){
                    cur_tree_str = cur_tree_str.replace(mock_op, cur_ops[i]);
                }
                var cur_tree = JSON.parse(cur_tree_str);
                var result = compute(cur_tree);
                var cur_eq = get_equation_str(cur_tree);
                if (result == target){
                    solution_eq = cur_eq;
                    has_solution = true;
                    break;
                }

            }
            if (has_solution) break;
        }
        if (has_solution) break;
    }

    if (has_solution) return solution_eq;
    else return "NO SOLUTION!";
}


module.exports = {
    'solve': solve
}






/*
 * For testing only
 */


/*
var input = '2 5 1 1';
var solution = solve(input, 31, ['+','-','*','/','**']);
console.log(solution);
//*/
