# Priority Scheduling Algorithm for Complaint Management System

## 1. Introduction

The Priority Scheduling Algorithm is a dynamic scoring system designed to automatically prioritize complaints submitted through the ConnectED platform. The algorithm ensures that critical issues, particularly safety-related complaints such as bullying, are addressed first while maintaining fairness for all complaint types through a time-based priority adjustment mechanism.

## 2. Algorithm Overview

The priority scheduling algorithm calculates a numerical priority score for each complaint based on three key factors:

1. **Category Weight** - Fixed weight assigned based on complaint category
2. **Urgency Weight** - User-selected urgency level
3. **Time Pending Bonus** - Dynamic bonus based on how long the complaint has been pending

### 2.1 Mathematical Formula

```
Priority Score = Category Weight + Urgency Weight + Time Pending Bonus
```

Where:
- **Category Weight** ∈ {10, 20, 30, 100}
- **Urgency Weight** ∈ {5, 15, 30, 50}
- **Time Pending Bonus** ∈ [0, 30] (capped at 30 points)

## 3. Component Breakdown

### 3.1 Category Weight Assignment

The algorithm assigns fixed weights to different complaint categories based on their relative importance:

| Category | Weight | Rationale |
|----------|--------|-----------|
| Bullying | 100 | Highest priority - addresses student safety and well-being |
| Academic | 30 | Important educational matters affecting student learning |
| Staff | 30 | Staff-related concerns requiring attention |
| Other | 20 | General complaints and miscellaneous issues |
| Facility | 10 | Infrastructure-related issues (lowest priority) |

**Implementation:**
```javascript
const categoryWeights = {
    'bullying': 100,
    'academic': 30,
    'staff': 30,
    'other': 20,
    'facility': 10
};
```

### 3.2 Urgency Level Weight Assignment

Users select an urgency level when submitting complaints, which contributes to the priority score:

| Urgency Level | Weight | Description |
|---------------|--------|-------------|
| Critical | 50 | Emergency situations requiring immediate response |
| High | 30 | Issues needing immediate attention |
| Medium | 15 | Matters that should be addressed soon |
| Low | 5 | Issues that can wait a few days |

**Implementation:**
```javascript
const urgencyWeights = {
    'critical': 50,
    'high': 30,
    'medium': 15,
    'low': 5
};
```

### 3.3 Time Pending Bonus

To prevent complaint starvation and ensure older complaints are not overlooked, the algorithm adds a time-based bonus:

- **Calculation:** Number of days since complaint creation
- **Formula:** `(Current Date - Creation Date) / (1000 × 60 × 60 × 24)`
- **Maximum Cap:** 30 points (after 30 days, bonus stops increasing)
- **Purpose:** Ensures fairness by gradually increasing priority of unresolved complaints

**Implementation:**
```javascript
const now = new Date();
const daysPending = (now - createdAt) / (1000 * 60 * 60 * 24);
score += Math.min(daysPending, 30);
```

## 4. Algorithm Workflow

### 4.1 Initial Score Calculation

When a complaint is first submitted:

1. Extract category, urgency, and creation timestamp
2. Look up category weight from predefined mapping
3. Look up urgency weight from predefined mapping
4. Calculate time pending (initially 0 for new complaints)
5. Sum all three components to get initial priority score
6. Store priority score in database

### 4.2 Dynamic Score Recalculation

The algorithm dynamically recalculates priority scores when administrators view the complaint dashboard:

1. Retrieve all complaints from database
2. For each complaint with status "pending" or "in-progress":
   - Recalculate time pending bonus based on current date
   - Recalculate total priority score
   - Update score in database
3. Sort complaints by priority score (descending)
4. If scores are equal, sort by creation date (ascending - older first)

**Implementation:**
```javascript
for (const complaint of complaints) {
    if (complaint.status === 'pending' || complaint.status === 'in-progress') {
        complaint.priorityScore = calculatePriorityScore(
            complaint.category,
            complaint.urgency,
            complaint.createdAt
        );
        await complaint.save();
    }
}
```

### 4.3 Sorting Mechanism

Complaints are sorted using a two-level sorting algorithm:

1. **Primary Sort:** Priority score (descending) - Higher scores appear first
2. **Secondary Sort:** Creation date (ascending) - Older complaints appear first when scores are equal

**Implementation:**
```javascript
complaints.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
});
```

## 5. Example Calculations

### Example 1: High Priority Complaint
- **Category:** Bullying
- **Urgency:** Critical
- **Days Pending:** 10 days

**Calculation:**
- Category Weight: 100
- Urgency Weight: 50
- Time Pending: 10
- **Total Priority Score: 160**

### Example 2: Medium Priority Complaint
- **Category:** Academic
- **Urgency:** High
- **Days Pending:** 5 days

**Calculation:**
- Category Weight: 30
- Urgency Weight: 30
- Time Pending: 5
- **Total Priority Score: 65**

### Example 3: Low Priority Complaint
- **Category:** Facility
- **Urgency:** Low
- **Days Pending:** 2 days

**Calculation:**
- Category Weight: 10
- Urgency Weight: 5
- Time Pending: 2
- **Total Priority Score: 17**

## 6. Design Principles

The algorithm is designed based on the following principles:

1. **Safety First:** Bullying complaints receive the highest category weight (100) to ensure student safety issues are always prioritized.

2. **User Input Consideration:** The urgency level selected by users directly impacts priority, giving users control over how their complaints are handled.

3. **Starvation Prevention:** The time-based bonus ensures that older complaints gradually gain priority, preventing them from being indefinitely delayed.

4. **Balanced Approach:** The algorithm balances three factors (category, urgency, time) to create a fair and effective prioritization system.

5. **Dynamic Adaptation:** Priority scores are recalculated dynamically, ensuring that time-sensitive factors are always current.

## 7. Advantages

1. **Automated Prioritization:** Reduces manual effort required to determine complaint handling order
2. **Consistency:** Ensures consistent prioritization based on objective criteria
3. **Fairness:** Time-based bonus prevents older complaints from being overlooked
4. **Safety Focus:** Guarantees critical safety issues (bullying) are always addressed first
5. **Scalability:** Algorithm performs efficiently even with large numbers of complaints
6. **Transparency:** Priority scores are visible to users, providing transparency in the system

## 8. Limitations and Considerations

1. **Fixed Weights:** Category and urgency weights are fixed and may need adjustment based on institutional needs
2. **Time Cap:** Time bonus is capped at 30 days, which may not be suitable for all scenarios
3. **No Context Awareness:** Algorithm does not consider complaint content or historical patterns
4. **Manual Override:** Currently, administrators cannot manually adjust priority scores

## 9. Future Enhancements

Potential improvements to the algorithm could include:

1. **Machine Learning Integration:** Use historical data to predict optimal priority scores
2. **Contextual Analysis:** Analyze complaint content to adjust priority dynamically
3. **Resource Availability:** Consider available staff/resources when calculating priority
4. **User Feedback Loop:** Incorporate resolution time feedback to refine weights
5. **Seasonal Adjustments:** Adjust weights based on academic calendar or seasonal factors

## 10. Conclusion

The Priority Scheduling Algorithm provides an effective, automated solution for managing complaint prioritization in the ConnectED platform. By combining category importance, user-selected urgency, and time-based fairness, the algorithm ensures that critical issues are addressed promptly while maintaining fairness for all complaint types. The dynamic recalculation mechanism ensures that priorities remain current and relevant as time passes.

---

**References:**
- Algorithm Implementation: `api/controllers/complaint.controller.js`
- Priority Score Calculation Function: `calculatePriorityScore()`
- Complaint Model: `api/models/complaint.model.js`
