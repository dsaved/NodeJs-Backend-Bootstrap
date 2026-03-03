/**
 * Issue License Script
 *
 * This script creates and issues a valid new license for a student by certificate number.
 * It simulates the complete license issuance flow including:
 * - CBT schedule creation and passing
 * - Driving test schedule creation and passing
 * - License request creation
 * - Transaction records for payments
 * - License approval and issuance
 *
 * Usage: npx ts-node scripts/issue-license.ts <certificateNo>
 * Example: npx ts-node scripts/issue-license.ts DRDK/LA/154289/184376
 *
 * All operations are wrapped in a database transaction for atomicity.
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';
import * as AllEntities from '../src/entities';

// Load environment variables
config();

// Enum imports
import {
  BookingStatus,
  TestStatus,
  LicenseRequestType,
  LicenseStatus,
  PaymentStatus,
  TransactionType,
  Sources,
  Status,
  ApprovalLevel,
  Reference,
} from '../src/core/constants/enums';

// Convert all imported entities to an array for TypeORM
const entities = Object.values(AllEntities);

// Extract specific entities we need to reference
const {
  Student,
  DrivingSchoolApplication,
  License,
  LicenseRequest,
  CbtSchedule,
  DrivingTestSchedule,
  Payment,
  CbtCenter,
  User,
} = AllEntities;

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'license',
  entities: entities,
  synchronize: false,
  logging: false,
});

/**
 * Generate unique integers for license number
 */
function generateUniqueIntegers(length: number, min: number, max: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * (max - min + 1) + min).toString();
  }
  return result;
}

/**
 * Generate unique payment reference
 */
function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY_${timestamp}_${random}`;
}

/**
 * Calculate license expiry date based on birthday
 */
function calculateLicenseExpiryByBirthday(
  dateOfBirth: string,
  years: number,
  issueDate: Date,
): Date {
  const dob = new Date(dateOfBirth);
  const issueYear = issueDate.getFullYear();

  // Calculate the next birthday after issue date + years
  let expiryYear = issueYear + years;

  // Create date for birthday in expiry year
  const birthdayThisYear = new Date(expiryYear, dob.getMonth(), dob.getDate());

  // If the birthday has already passed this year, use next year's birthday
  if (birthdayThisYear <= issueDate) {
    expiryYear += 1;
  }

  return new Date(expiryYear, dob.getMonth(), dob.getDate());
}

/**
 * Generate a unique license number
 */
async function generateLicenseNo(licenseRepository: any): Promise<string> {
  let licenseNo: string;
  let exists = true;

  while (exists) {
    licenseNo = generateUniqueIntegers(8, 0, 9);
    const count = await licenseRepository.count({ where: { licenseNo } });
    exists = count > 0;
  }

  return licenseNo!;
}

/**
 * Main function to issue license
 */
async function issueLicense(certificateNo: string): Promise<void> {
  Logger.log('\nStarting License Issuance Process...');
  Logger.log(`Certificate Number: ${certificateNo}\n`);

  // Initialize database connection
  await AppDataSource.initialize();
  Logger.log('[OK] Database connection established');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Step 1: Find the student by certificate number
    Logger.log('\nStep 1: Finding student...');
    let student = await queryRunner.manager.findOne(Student, {
      where: { certificateNo },
      relations: ['application', 'drivingSchool'],
    });

    // If not found by certificateNo, try to find by studentNo and update certificateNo
    if (!student) {
      // Extract student number pattern from certificate number
      const certParts = certificateNo.split('/');
      if (certParts.length >= 2) {
        const searchPattern = certParts[certParts.length - 1]; // Get last part
        student = await queryRunner.manager
          .createQueryBuilder(Student, 's')
          .leftJoinAndSelect('s.application', 'application')
          .leftJoinAndSelect('s.drivingSchool', 'drivingSchool')
          .where('s.studentNo LIKE :pattern', { pattern: `%${searchPattern}` })
          .getOne();

        if (student && !student.certificateNo) {
          // Update the student with the certificate number
          await queryRunner.manager.update(Student, { id: student.id }, { certificateNo });
          student.certificateNo = certificateNo;
          Logger.log(`   Updated student ${student.studentNo} with certificate number`);
        }
      }
    }

    if (!student) {
      throw new Error(`Student with certificate number ${certificateNo} not found`);
    }

    Logger.log(`'[OK] Found student: ${student.studentNo} (ID: ${student.id})`);

    // Step 2: Get the driving school application
    Logger.log('\nStep 2: Fetching driving school application...');
    const application = await queryRunner.manager.findOne(DrivingSchoolApplication, {
      where: { id: student.applicationId },
    });

    if (!application) {
      throw new Error(`Driving school application not found for student ${student.id}`);
    }

    Logger.log(`'[OK] Found application: ${application.applicationNo} (ID: ${application.id})`);
    Logger.log(`'[OK] Applicant: ${application.firstName} ${application.lastName}`);

    // Step 3: Get or create user
    Logger.log('\nStep 3: Verifying user account...');
    let user = await queryRunner.manager.findOne(User, {
      where: { id: application.userId },
    });

    if (!user) {
      throw new Error(`User account not found for application ${application.id}`);
    }

    Logger.log(`'[OK] Found user: ${user.email} (ID: ${user.id})`);

    // Step 4: Find or create CBT Center
    Logger.log('\nStep 4: Finding CBT center...');
    let cbtCenter = await queryRunner.manager.findOne(CbtCenter, {
      where: { isActive: Status.Active },
      order: { id: 'ASC' },
    });

    if (!cbtCenter) {
      throw new Error('No active CBT center found. Please create one first.');
    }

    Logger.log(`'[OK] Using CBT center: ${cbtCenter.name} (ID: ${cbtCenter.id})`);

    // Step 5: Create CBT schedule payment transaction
    Logger.log('\nStep 5: Creating CBT schedule payment...');
    const cbtPaymentReference = generatePaymentReference();
    const cbtPayment = await queryRunner.manager.save(Payment, {
      userId: user.id,
      email: application.email,
      amount: 5000, // CBT test fee
      status: PaymentStatus.Completed,
      reference: cbtPaymentReference,
      channel: 'script',
      type: TransactionType.cbtSchedulePayment,
      currency: 'NGN',
      log: JSON.stringify({ source: 'issue-license-script', timestamp: new Date().toISOString() }),
      itemType: 'cbt_schedule',
      provider: 'script',
      used: Reference.Used,
    });

    Logger.log(`'[OK] Created CBT payment: ${cbtPaymentReference} (ID: ${cbtPayment.id})`);

    // Step 6: Create CBT schedule (passed)
    Logger.log('\nStep 6: Creating CBT schedule...');
    const today = new Date();
    const cbtDate = new Date(today);
    cbtDate.setDate(cbtDate.getDate() - 7); // CBT was 7 days ago

    const cbtSchedule = await queryRunner.manager.save(CbtSchedule, {
      studentId: student.id,
      cbtCenterId: cbtCenter.id,
      stateId: application.stateId || application.stateOfOriginId || 25,
      lgaId: application.lgaOfOriginId || 1,
      transactionId: cbtPayment.id,
      date: cbtDate.toISOString().split('T')[0],
      time: '10:00:00',
      score: 85, // Passing score
      years: 3,
      answers: { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A' }, // Sample answers
      status: BookingStatus.Booked,
      cbtStatus: TestStatus.Passed,
      licenseClassId: 2, // Class B
    });

    Logger.log(`'[OK] Created CBT schedule (ID: ${cbtSchedule.id}) - Status: PASSED (Score: 85%)`);

    // Step 7: Create driving test payment transaction
    Logger.log('\nStep 7: Creating driving test payment...');
    const drivingTestPaymentReference = generatePaymentReference();
    const drivingTestPayment = await queryRunner.manager.save(Payment, {
      userId: user.id,
      email: application.email,
      amount: 7500, // Driving test fee
      status: PaymentStatus.Completed,
      reference: drivingTestPaymentReference,
      channel: 'script',
      type: TransactionType.drivingTestPayment,
      currency: 'NGN',
      log: JSON.stringify({ source: 'issue-license-script', timestamp: new Date().toISOString() }),
      itemType: 'driving_test_schedule',
      provider: 'script',
      used: Reference.Used,
    });

    Logger.log(
      `'[OK] Created driving test payment: ${drivingTestPaymentReference} (ID: ${drivingTestPayment.id})`,
    );

    // Step 8: Create driving test schedule (passed)
    Logger.log('\nStep 8: Creating driving test schedule...');
    const drivingTestDate = new Date(today);
    drivingTestDate.setDate(drivingTestDate.getDate() - 3); // Driving test was 3 days ago

    const drivingTestSchedule = await queryRunner.manager.save(DrivingTestSchedule, {
      studentId: student.id,
      cbtCenterId: cbtCenter.id, // Using CBT center for driving test
      stateId: application.stateId || application.stateOfOriginId || 25,
      lgaId: application.lgaOfOriginId || 1,
      transactionId: drivingTestPayment.id,
      date: drivingTestDate.toISOString().split('T')[0],
      time: '09:00:00',
      years: 3,
      score: 90, // Passing score
      answers: [
        { category: 'Parking', question: 'Parallel Parking', result: 'Pass' },
        { category: 'Maneuvering', question: 'Lane Change', result: 'Pass' },
        { category: 'Reversing', question: 'Reverse', result: 'Pass' },
        { category: 'Emergency', question: 'Emergency Stop', result: 'Pass' },
        { category: 'Knowledge', question: 'Road Signs', result: 'Pass' },
      ],
      vehicleType: 'Sedan',
      location: 'LASDRI Driving Test Center',
      bookingStatus: BookingStatus.Booked,
      status: TestStatus.Passed,
      licenseClassId: 2, // Class B
    });

    Logger.log(
      `'[OK] Created driving test schedule (ID: ${drivingTestSchedule.id}) - Status: PASSED (Score: 90%)`,
    );

    // Step 9: Create new license payment transaction
    Logger.log('\nStep 9: Creating new license payment...');
    const licensePaymentReference = generatePaymentReference();
    const licensePayment = await queryRunner.manager.save(Payment, {
      userId: user.id,
      email: application.email,
      amount: 15000, // New license fee
      status: PaymentStatus.Completed,
      reference: licensePaymentReference,
      channel: 'script',
      type: TransactionType.newLicense,
      currency: 'NGN',
      log: JSON.stringify({ source: 'issue-license-script', timestamp: new Date().toISOString() }),
      itemType: 'license',
      provider: 'script',
      used: Reference.Used,
    });

    Logger.log(
      `'[OK] Created license payment: ${licensePaymentReference} (ID: ${licensePayment.id})`,
    );

    // Step 10: Create license request
    Logger.log('\nStep 10: Creating license request...');
    const licenseRequest = await queryRunner.manager.save(LicenseRequest, {
      userId: user.id,
      drivingSchoolApplicationId: application.id,
      requestType: LicenseRequestType.New,
      status: LicenseStatus.Processing,
      applicationNo: application.applicationNo,
      reference: licensePaymentReference,
      licenseClassId: 2, // Class B
      years: 3,
      stateId: application.stateId || application.stateOfOriginId || 25,
      lgaId: application.lgaOfOriginId || 1,
      residentialStateId: application.residentialStateId,
      isExternal: false,
      cbtScheduleId: cbtSchedule.id,
      drivingTestScheduleId: drivingTestSchedule.id,
      transactionId: licensePayment.id,
      source: Sources.PublicPortal,
      requestedAt: new Date(),
    });

    Logger.log(`'[OK] Created license request (ID: ${licenseRequest.id})`);

    // Update CBT schedule with license request ID
    await queryRunner.manager.update(
      CbtSchedule,
      { id: cbtSchedule.id },
      { licenseRequestId: licenseRequest.id },
    );

    // Update driving test schedule with license request ID
    await queryRunner.manager.update(
      DrivingTestSchedule,
      { id: drivingTestSchedule.id },
      { licenseRequestId: licenseRequest.id },
    );

    // Step 11: Generate license number
    Logger.log('\nStep 11: Generating license number...');
    const licenseNo = await generateLicenseNo(queryRunner.manager.getRepository(License));
    Logger.log(`'[OK] Generated license number: ${licenseNo}`);

    // Step 12: Calculate license dates
    Logger.log('\nStep 12: Calculating license dates...');
    const issuedAt = new Date();
    const expiryAt = calculateLicenseExpiryByBirthday(application.dateOfBirth, 3, issuedAt);
    Logger.log(`'[OK] Issue date: ${issuedAt.toISOString().split('T')[0]}`);
    Logger.log(`'[OK] Expiry date: ${expiryAt.toISOString().split('T')[0]}`);

    // Step 13: Create the license record
    Logger.log('\nStep 13: Creating license record...');
    const license = await queryRunner.manager.save(License, {
      // Student and application references
      studentId: student.id,
      certificateNo: student.certificateNo,
      applicationNo: application.applicationNo,
      drivingSchoolId: student.drivingSchoolId,
      cbtScheduleId: cbtSchedule.id,
      cbtCenterId: cbtCenter.id,
      drivingTestScheduleId: drivingTestSchedule.id,
      // drivingTestCenterId is not set - using CBT center for driving test instead

      // User reference
      userId: user.id,

      // Personal information from application
      titleId: application.titleId,
      firstName: application.firstName,
      lastName: application.lastName,
      middleName: application.middleName,
      maidenName: application.maidenName || '',
      email: application.email,
      phone: application.phone,
      address: application.address,
      dateOfBirth: application.dateOfBirth,
      genderId: application.genderId,
      requestType: LicenseRequestType.New,

      // Location information
      stateId: application.stateId || application.stateOfOriginId || 25,
      lgaId: application.lgaOfOriginId || 1,
      residentialStateId: application.residentialStateId,
      nationalityId: application.nationalityId || 1,

      // Physical characteristics
      height: application.height || 170,
      weight: application.weight || 70,
      eyeColor: application.eyeColor,
      facialMarks: application.facialMarks,
      glasses: application.glasses,
      disability: application.disability,

      // License specific information
      licenseNo: licenseNo,
      licenseClassId: 2, // Class B
      years: 3,
      issuedAt: issuedAt,
      expiryAt: expiryAt,

      // Status and metadata
      status: LicenseStatus.Completed,
      approvalLevel: ApprovalLevel.LevelOne,
      isActive: Status.Active,
      source: Sources.PublicPortal,

      // Transaction reference
      reference: licensePaymentReference,
      transactionId: licensePayment.id,
    });

    Logger.log(`'[OK] Created license record (ID: ${license.id})`);

    // Step 14: Update license request with license ID and completion status
    Logger.log('\nStep 14: Finalizing license request...');
    await queryRunner.manager.update(
      LicenseRequest,
      { id: licenseRequest.id },
      {
        licenseId: license.id,
        licenseNo: licenseNo,
        status: LicenseStatus.Completed,
        completedAt: new Date(),
        issuedAt: issuedAt,
      },
    );

    Logger.log(`'[OK] License request finalized`);

    // Step 15: Update student graduated status
    Logger.log('\nStep 15: Updating student status...');
    await queryRunner.manager.update(
      Student,
      { id: student.id },
      {
        graduated: true,
        isActive: Status.Active,
        certificateNo: student.certificateNo || certificateNo,
      },
    );

    Logger.log(`'[OK] Student marked as graduated`);

    // Step 16: Commit the transaction
    await queryRunner.commitTransaction();
    Logger.log('\n[OK] Transaction committed successfully!');

    // Summary
    Logger.log('\n' + '='.repeat(60));
    Logger.log('LICENSE ISSUANCE SUMMARY');
    Logger.log('='.repeat(60));
    Logger.log(`\nStudent Information:`);
    Logger.log(`   Student No: ${student.studentNo}`);
    Logger.log(`   Certificate No: ${student.certificateNo || certificateNo}`);
    Logger.log(`   Name: ${application.firstName} ${application.middleName || ''} ${application.lastName}`);
    Logger.log(`   Email: ${application.email}`);

    Logger.log(`\nTest Results:`);
    Logger.log(`   CBT Test: PASSED (Score: 85%) - ID: ${cbtSchedule.id}`);
    Logger.log(`   Driving Test: PASSED (Score: 90%) - ID: ${drivingTestSchedule.id}`);

    Logger.log(`\nTransactions Created:`);
    Logger.log(`   1. CBT Payment: ${cbtPaymentReference} - ₦5,000`);
    Logger.log(`   2. Driving Test Payment: ${drivingTestPaymentReference} - ₦7,500`);
    Logger.log(`   3. License Payment: ${licensePaymentReference} - ₦15,000`);

    Logger.log(`\nLicense Details:`);
    Logger.log(`   License ID: ${license.id}`);
    Logger.log(`   License No: ${licenseNo}`);
    Logger.log(`   License Class: B (Vehicles)`);
    Logger.log(`   Validity: 3 years`);
    Logger.log(`   Issued: ${issuedAt.toISOString().split('T')[0]}`);
    Logger.log(`   Expires: ${expiryAt.toISOString().split('T')[0]}`);
    Logger.log(`   Status: ${LicenseStatus.Completed}`);

    Logger.log(`\nLicense Request:`);
    Logger.log(`   Request ID: ${licenseRequest.id}`);
    Logger.log(`   Application No: ${application.applicationNo}`);
    Logger.log(`   Status: ${LicenseStatus.Completed}`);

    Logger.log('\n' + '='.repeat(60));
    Logger.log('LICENSE ISSUED SUCCESSFULLY!');
    Logger.log('='.repeat(60) + '\n');
  } catch (error: any) {
    // Rollback on any error
    await queryRunner.rollbackTransaction();
    Logger.error('\n[ERROR] Error occurred, transaction rolled back:');
    Logger.error(`   ${error.message}`);
    Logger.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
    Logger.log('[OK] Database connection closed');
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  Logger.error('\n[ERROR] Certificate number is required');
  Logger.error('Usage: npx ts-node scripts/issue-license.ts <certificateNo>');
  Logger.error('Example: npx ts-node scripts/issue-license.ts DRDK/LA/154289/184376\n');
  process.exit(1);
}

const certificateNo = args[0];

issueLicense(certificateNo)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    Logger.error('Fatal error:', error);
    process.exit(1);
  });
