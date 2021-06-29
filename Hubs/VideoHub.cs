using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace SyncVideoPlayer.Hubs
{
    public class VideoHub : Hub
    {
        public async Task VideoPlay()
        {
            await Clients.All.SendAsync(nameof(VideoPlay));
        }
        public async Task VideoPause()
        {
            await Clients.All.SendAsync(nameof(VideoPause));
        }

        public async Task ChangeVideoTime(string time)
        {
            await Clients.All.SendAsync(nameof(ChangeVideoTime), time);
        }
    }
}