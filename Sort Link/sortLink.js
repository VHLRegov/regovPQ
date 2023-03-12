class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function merge(list1, list2) {
  const dummy = new ListNode();
  let current = dummy;

  while (list1 && list2) {
    if (list1.val < list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }

    current = current.next;
  }

  if (list1) {
    current.next = list1;
  }

  if (list2) {
    current.next = list2;
  }

  return dummy.next;
}

function mergeSortList(head) {
  if (!head || !head.next) {
    return head;
  }

  let slow = head;
  let fast = head.next;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }

  const mid = slow.next;
  slow.next = null;

  const left = mergeSortList(head);
  const right = mergeSortList(mid);

  return merge(left, right);
}

// Example usage:
const head = new ListNode(5, new ListNode(2, new ListNode(8, new ListNode(9))));
const sortedList = mergeSortList(head);

let currentNode = sortedList;
while (currentNode !== null) {
  console.log(currentNode.val);
  currentNode = currentNode.next;
}

// Output: 1 -> 2 -> 3 -> 4
//console.log(sortedList);