import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  AfterCreate,
} from 'sequelize-typescript';
import { enums } from '../constructs';

@Table({ tableName: 'notifications' })
export class Notification extends Model<Notification> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  public id: string;

  @Column({ 
    type: DataType.INTEGER,
    validate: { isIn: [Object.values(enums.EmailStatusNum)] }
  })
  public status: number;

  @Column({ type: DataType.STRING(50) })
  public to: string;

  @Column({ type: DataType.STRING(100) })
  public from: string;

  @Column({ type: DataType.STRING(100) })
  public subject: string;

  @Column({ type: DataType.TEXT })
  public text: string;

  @Column({ type: DataType.BOOLEAN })
  public seen: boolean;

  @Default(enums.NotificationTypeEnumNum.email)
  @Column({ 
    type: DataType.INTEGER,
    validate: { isIn: [Object.values(enums.NotificationTypeEnumNum)] }
  })
  public type: number;

  @AllowNull
  @Column({ type: DataType.JSON })
  public attachments: any;

  @CreatedAt
  @Column({ field: 'created_at' })
  public createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  public updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at' })
  public deletedAt: Date;

  @AfterCreate
  static async sendNotificationHook(notification: Notification) {
    try {
      // Note: Import sendNotification function based on your setup
      // await sendNotification(notification);
      console.log('Notification created:', notification.id);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}
