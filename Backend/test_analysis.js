/**
 * Analysis API Test and Usage Guide
 * 
 * This file demonstrates how to use all the analysis functions
 * with practical examples and guidance.
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const LOGIN_SESSION_ID = '463758095971573'; // Replace with actual session ID
const ADMIN_SESSION_ID = '112370552740325'; // Replace with actual admin session ID
const SESI = '2024/2025';
const SEMESTER = '2';

// Helper function to make API calls
async function makeRequest(endpoint, params = {}) {
  try {
    // Use adminSessionId by default for most calls
    const defaultParams = { adminSessionId: ADMIN_SESSION_ID };
    const finalParams = { ...defaultParams, ...params };
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, { params: finalParams });
    console.log(`✅ ${endpoint}:`, response.data.message);
    return response.data;
  } catch (error) {
    console.error(`❌ ${endpoint}:`, error.response?.data?.error || error.message);
    return null;
  }
}

// ============================================================================
// STUDENT ANALYSIS TESTS
// ============================================================================

async function testStudentAnalysis() {
  console.log('\n🎓 STUDENT ANALYSIS TESTS');
  console.log('=' .repeat(50));

  // 1. Get students over the years (now includes faculty, program, and year level breakdowns)
  console.log('\n1. Testing: Get students over the years');
  console.log('   - Now includes: Faculty (kod_fakulti), Program (kod_kursus), Year Level (tahun_kursus)');
  await makeRequest('/analysis/students/over-years');

  // 2. Get student statistics by year and semester with detailed breakdowns
  console.log('\n2. Testing: Get student statistics by year and semester with detailed breakdowns');
  console.log('   - Includes: Faculty, Program, and Year Level statistics for specific semester');
  await makeRequest(`/analysis/students/stats/${SESI}`, { semester: SEMESTER });
}

// ============================================================================
// LECTURER ANALYSIS TESTS
// ============================================================================

async function testLecturerAnalysis() {
  console.log('\n👨‍🏫 LECTURER ANALYSIS TESTS');
  console.log('=' .repeat(50));

  // 1. Get lecturer workload
  console.log('\n1. Testing: Get lecturer workload analysis');
  await makeRequest('/analysis/lecturers/workload', {
    sesi: SESI,
    semester: SEMESTER
  });

  // 2. Get top lecturers
  console.log('\n2. Testing: Get top lecturers by sections/work hours');
  await makeRequest('/analysis/lecturers/top', {
    sesi: SESI,
    semester: SEMESTER,
    limit: 5
  });

  // 3. Check lecturer conflicts
  console.log('\n3. Testing: Check for lecturer conflicts');
  await makeRequest('/analysis/lecturers/conflicts', {
    sesi: SESI,
    semester: SEMESTER
  });
}

// ============================================================================
// COURSE ANALYSIS TESTS
// ============================================================================

async function testCourseAnalysis() {
  console.log('\n📚 COURSE ANALYSIS TESTS');
  console.log('=' .repeat(50));

  // 1. Get section statistics (per section)
  console.log('\n1. Testing: Get sections statistics (number of students per section)');
  await makeRequest('/analysis/courses/sections', {
    sesi: SESI,
    semester: SEMESTER
  });

  // 2. Get course statistics (aggregated by course)
  console.log('\n2. Testing: Get course statistics (aggregated by course code)');
  await makeRequest('/analysis/courses/courses', {
    sesi: SESI,
    semester: SEMESTER
  });

  // 3. Get top sections
  console.log('\n3. Testing: Get top sections with registered students');
  await makeRequest('/analysis/courses/top-sections', {
    sesi: SESI,
    semester: SEMESTER,
    limit: 10
  });

  // 4. Get top courses
  console.log('\n4. Testing: Get top courses with registered students');
  await makeRequest('/analysis/courses/top-courses', {
    sesi: SESI,
    semester: SEMESTER,
    limit: 10
  });

  // 5. Check course conflicts
  console.log('\n5. Testing: Check for course conflicts');
  await makeRequest('/analysis/courses/conflicts', {
    sesi: SESI,
    semester: SEMESTER
  });
}

// ============================================================================
// ROOM ANALYSIS TESTS
// ============================================================================

async function testRoomAnalysis() {
  console.log('\n🏢 ROOM ANALYSIS TESTS');
  console.log('=' .repeat(50));

  // 1. Check room clashes
  console.log('\n1. Testing: Check for room clashes');
  await makeRequest('/analysis/rooms/clashes', {
    sesi: SESI,
    semester: SEMESTER
  });

  // 2. Get room utilization
  console.log('\n2. Testing: Get room utilization statistics');
  await makeRequest('/analysis/rooms/utilization', {
    sesi: SESI,
    semester: SEMESTER
  });
}

// ============================================================================
// GENERAL ANALYSIS TESTS
// ============================================================================

async function testGeneralAnalysis() {
  console.log('\n📊 GENERAL ANALYSIS TESTS');
  console.log('=' .repeat(50));

  // 1. Get system overview
  console.log('\n1. Testing: Get comprehensive system overview');
  await makeRequest('/analysis/overview', {
    sesi: SESI,
    semester: SEMESTER
  });

  // 2. Get bulk analysis (all reports)
  console.log('\n2. Testing: Get bulk analysis (all reports)');
  await makeRequest('/analysis/bulk', {
    sesi: SESI,
    semester: SEMESTER
  });

  // 3. Get specific reports in bulk
  console.log('\n3. Testing: Get specific reports in bulk');
  await makeRequest('/analysis/bulk', {
    sesi: SESI,
    semester: SEMESTER,
    'reports[]': 'lecturer-workload',
    'reports[]': 'room-clashes',
    'reports[]': 'top-sections'
  });
}

// ============================================================================
// API DOCUMENTATION TEST
// ============================================================================

async function testApiDocumentation() {
  console.log('\n📖 API DOCUMENTATION TEST');
  console.log('=' .repeat(50));

  console.log('\nTesting: Get API documentation');
  await makeRequest('/analysis/docs');
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('🚀 STARTING ANALYSIS API TESTS');
  console.log('=' .repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Session: ${SESI}/${SEMESTER}`);
  console.log('=' .repeat(60));

  try {
    // Test API documentation first
    await testApiDocumentation();

    // Test all analysis categories
    await testStudentAnalysis();
    await testLecturerAnalysis();
    await testCourseAnalysis();
    await testRoomAnalysis();
    await testGeneralAnalysis();

    console.log('\n🎉 ALL TESTS COMPLETED!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n💥 TEST RUNNER ERROR:', error.message);
  }
}

// ============================================================================
// USAGE GUIDANCE AND EXAMPLES
// ============================================================================

function printUsageGuidance() {
  console.log('\n📋 USAGE GUIDANCE');
  console.log('=' .repeat(60));

  console.log(`
🔧 SETUP INSTRUCTIONS:
1. Make sure the server is running: npm start
2. Update LOGIN_SESSION_ID and ADMIN_SESSION_ID in this file
3. Run: node test_analysis.js

📊 ANALYSIS FUNCTIONS OVERVIEW:

🎓 STUDENT ANALYSIS:
• getStudentsOverYears() - Track student enrollment trends over years
• getStudentStatsByYearAndProgram() - Detailed breakdown by year and program

👨‍🏫 LECTURER ANALYSIS:
• getLecturerWorkload() - Analyze teaching hours and course load
• getTopLecturers() - Find most active lecturers by sections/hours
• checkLecturerConflicts() - Detect scheduling conflicts for lecturers

📚 COURSE ANALYSIS:
• getSectionStatistics() - Count students per section
• getTopSections() - Find most popular sections
• checkCourseConflicts() - Identify courses with multiple sections

🏢 ROOM ANALYSIS:
• checkRoomClashes() - Detect double-booked rooms
• getRoomUtilization() - Calculate room usage efficiency

📊 GENERAL ANALYSIS:
• getSystemOverview() - Complete system summary
• getBulkAnalysis() - Get multiple reports in one request

🔍 PRACTICAL USE CASES:

1. ACADEMIC PLANNING:
   - Use student statistics to plan course offerings
   - Analyze lecturer workload for fair distribution
   - Check room utilization for capacity planning

2. CONFLICT RESOLUTION:
   - Run lecturer conflicts check before semester starts
   - Verify room clashes to prevent scheduling issues
   - Review course conflicts for optimal section distribution

3. PERFORMANCE MONITORING:
   - Track top lecturers for recognition
   - Monitor popular sections for resource allocation
   - Analyze room efficiency for facility management

4. REPORTING:
   - Generate comprehensive reports using bulk analysis
   - Create year-over-year comparisons
   - Export data for external analysis tools

⚡ PERFORMANCE TIPS:
• Use bulk analysis for multiple reports to reduce API calls
• Cache results for frequently accessed data
• Use limit parameters to control response size
• Handle errors gracefully in production applications

🔐 AUTHENTICATION:
• Most endpoints require either loginSessionId or adminSessionId
• Admin session provides broader access to data
• Session IDs expire, so refresh as needed

📈 DATA INTERPRETATION:
• Student counts are per session/semester
• Workload hours are calculated from timetable slots
• Utilization rates are percentages of total available time
• Conflicts indicate potential scheduling issues
  `);
}

// ============================================================================
// EXPORT FOR USE IN OTHER FILES
// ============================================================================

module.exports = {
  runAllTests,
  testStudentAnalysis,
  testLecturerAnalysis,
  testCourseAnalysis,
  testRoomAnalysis,
  testGeneralAnalysis,
  testApiDocumentation,
  printUsageGuidance
};

// ============================================================================
// RUN TESTS IF THIS FILE IS EXECUTED DIRECTLY
// ============================================================================

if (require.main === module) {
  printUsageGuidance();
  
  // Uncomment the line below to run tests
   runAllTests();
  
  console.log('\n💡 To run tests, uncomment the runAllTests() line at the bottom of this file');
  console.log('💡 Make sure to update the session IDs first!');
} 