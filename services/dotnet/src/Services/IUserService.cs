using System.Collections.Generic;
using System.Threading.Tasks;
using dotnet.Data;

namespace dotnet.Services
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> CreateUserAsync(User user);
    }
}