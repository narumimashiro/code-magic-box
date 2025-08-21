import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ type: 'varchar', length: 100 })
    name: string;
    
    @Column({ type: 'varchar', unique: true, length: 100 })
    email: string;
    
    @Column({ nullable: true })
    age: number;
    
    @CreateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}