function maxProduct(nums) {
    let max = nums[0];
    let currentMax = nums[0];
    let currentMin = nums[0];
  
    for (let i = 1; i < nums.length; i++) {
      const num = nums[i];
      const temp = currentMax;
      currentMax = Math.max(num, currentMax * num, currentMin * num);
      currentMin = Math.min(num, temp * num, currentMin * num);
      max = Math.max(max, currentMax);
    }
  
    return max;
  }
  
  // Example usage:
  console.log(maxProduct([2, 3, -2, 4])); // Output: 6
  console.log(maxProduct([-2, 0, -1])); // Output: 0