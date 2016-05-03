var mock_eq = {};
var mock_num = 'n';
var mock_op = 'o';
mock_eq[0] = [mock_num];
// Generate all possible equation (similar with algo to generate all binary trees)
var generate_mock_eq = function(n){
    if (!(n in mock_eq)){
        mock_eq[n] = [];
        for (var i=0; i < n; ++i){
            var left_childs = generate_mock_eq(i);
            var right_childs = generate_mock_eq(n-i-1);
            for (l in left_childs){
                for (r in right_childs){
                    mock_eq[n].push( '(' + left_childs[l] + ' ' + mock_op + ' ' + right_childs[r] + ')');
                }
            }
        }
    }
    return mock_eq[n];
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
    var nums = input.split(' ');
    if (typeof(ops) === 'undefined'){
        ops = ['+', '-', '*', '/', '>>', '<<']
    }

    var n_num = nums.length;
    var n_op = n_num-1;

    var eq_choices = generate_mock_eq(n_op);
    var ops_choices = getPermutations(ops, n_op);
    var nums_choices = getPermutations(nums, n_num);

    var solution_eq = '';
    var has_solution = false;

    for (var nums_id in nums_choices){
        var cur_nums = nums_choices[nums_id];
        for (var ops_id in ops_choices){
            var cur_ops = ops_choices[ops_id];
            for (var eq_id in eq_choices){
                var cur_eq = eq_choices[eq_id];
                for (var i=0; i < n_num; ++i){
                    cur_eq = cur_eq.replace(mock_num, cur_nums[i])
                }
                for (var i=0; i < n_op; ++i){
                    cur_eq = cur_eq.replace(mock_op, cur_ops[i])
                }
                var result = eval(cur_eq);
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

