import { JiraService } from "./jira.service";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("JiraService", () => {
  let service: JiraService;

  beforeEach(() => {
    service = new JiraService();
    jest.clearAllMocks();
    process.env.JIRA_BASE_URL = "https://test.atlassian.net";
    process.env.JIRA_AUTH_64 = "base64auth";
  });

  describe("getProjectsByKeys", () => {
    it("should return empty object for empty project keys", async () => {
      const result = await service.getProjectsByKeys([]);
      
      expect(result).toEqual({});
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("should fetch projects and return dictionary", async () => {
      const mockProject = {
        id: "10000",
        key: "PROJ",
        name: "Project Alpha",
        projectTypeKey: "software",
      };

      mockedAxios.get.mockResolvedValue({ data: mockProject });

      const result = await service.getProjectsByKeys(["PROJ"]);

      expect(result).toEqual({
        PROJ: mockProject,
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://test.atlassian.net/rest/api/3/project/PROJ",
        {
          headers: { Authorization: "Basic base64auth" },
        }
      );
    });

    it("should handle multiple project keys", async () => {
      const mockProjects = [
        {
          id: "10000",
          key: "PROJ",
          name: "Project Alpha",
          projectTypeKey: "software",
        },
        {
          id: "10001",
          key: "OTHR",
          name: "Other Project",
          projectTypeKey: "software",
        },
      ];

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockProjects[0] })
        .mockResolvedValueOnce({ data: mockProjects[1] });

      const result = await service.getProjectsByKeys(["PROJ", "OTHR"]);

      expect(result).toEqual({
        PROJ: mockProjects[0],
        OTHR: mockProjects[1],
      });
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it("should deduplicate project keys", async () => {
      const mockProject = {
        id: "10000",
        key: "PROJ",
        name: "Project Alpha",
        projectTypeKey: "software",
      };

      mockedAxios.get.mockResolvedValue({ data: mockProject });

      const result = await service.getProjectsByKeys(["PROJ", "PROJ", "PROJ"]);

      expect(result).toEqual({
        PROJ: mockProject,
      });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should handle API errors gracefully", async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ 
          data: {
            id: "10000",
            key: "PROJ",
            name: "Project Alpha",
            projectTypeKey: "software",
          }
        })
        .mockRejectedValueOnce(new Error("Project not found"));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await service.getProjectsByKeys(["PROJ", "MISSING"]);

      expect(result).toEqual({
        PROJ: {
          id: "10000",
          key: "PROJ",
          name: "Project Alpha",
          projectTypeKey: "software",
        },
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch project MISSING:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle all projects failing", async () => {
      mockedAxios.get.mockRejectedValue(new Error("API Error"));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await service.getProjectsByKeys(["PROJ", "OTHR"]);

      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });
  });

  describe("getUserData", () => {
    it("should fetch current user data", async () => {
      const mockUserData = {
        accountId: "current-user",
        displayName: "Current User",
        emailAddress: "current@example.com",
        active: true,
      };

      mockedAxios.get.mockResolvedValue({ data: mockUserData });

      const result = await service.getUserData();

      expect(result).toEqual(mockUserData);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://test.atlassian.net/rest/api/3/myself",
        {
          headers: {
            Authorization: "Basic base64auth",
          },
        }
      );
    });
  });

  describe("getUsersByAccountIds", () => {
    it("should fetch multiple users", async () => {
      const mockUsers = [
        {
          accountId: "user1",
          displayName: "John Doe",
          emailAddress: "john@example.com",
          avatarUrls: { "48x48": "avatar1.png" },
          active: true,
        },
        {
          accountId: "user2",
          displayName: "Jane Smith",
          emailAddress: "jane@example.com",
          avatarUrls: { "48x48": "avatar2.png" },
          active: true,
        },
      ];

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockUsers[0] })
        .mockResolvedValueOnce({ data: mockUsers[1] });

      const result = await service.getUsersByAccountIds(["user1", "user2"]);

      expect(result).toEqual(mockUsers);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
});