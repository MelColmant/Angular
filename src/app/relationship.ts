export interface Relationship {
    RelationshipId: number;
    Person1Id: number;
    Person2Id: number;
    StartDate: Date;
    EndDate: Date;
    IsUnisex: boolean;
    RelationshipTypeCode: string;
    TreeId: number;
}