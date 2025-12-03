export enum NotificationType {
    UserCreatedReactionOnVisualization = 'user.reaction.visualization',
    UserTaggedInComment = 'user.tag.comment',
    UserCommentReplied = 'user.comment.replied',
    CustomerReactionCountChanged = 'customer.reaction.count.changed',
    CustomerCommentCountChanged = 'customer.comment.count.changed',
    FeedbackCreated = 'user.feedback.created',
}

export interface Notification {
    type?: NotificationType;
    userId?: string;
    customerId?: string;
    data?: any;
}
